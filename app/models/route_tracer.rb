require 'ruby-prof'
require 'priority_queue'

class RouteTracer
  @point_cache = []

  def self.calculate_point_cache
    @point_cache.clear
    old_level = ActiveRecord::Base.logger.level
    i = 1
    count = RoutePoint.count
    ActiveRecord::Base.logger.level = 1
    RoutePoint.all.includes(:point).each do |rp|
      puts "#{i}/#{count}..."
      rp.calculate_nearest_ways_point
      rp.cached_costs = {}
      rp.neighbors(nil, nil).each do |neighbor|
        print "*"
        rp.cached_costs[neighbor] = rp.cost_to neighbor
      end
      puts ""
      @point_cache << rp
      i += 1
    end
    ActiveRecord::Base.logger.level = old_level
    save_point_cache
  end

  def self.save_point_cache
    serialized = @point_cache.map{|rp| [rp.id, rp.cached_costs.map{|n,c| [n.id, c]}.to_h]}.to_h
    File.write('/tmp/achabus-point-cache.json', serialized.to_json)
  end

  def self.load_point_cache
    puts "Carregando..."
    id_hash = JSON.parse(File.read('/tmp/achabus-point-cache.json'))
    @point_cache = RoutePoint.find(id_hash.keys)
    @point_cache.each do |rp|
      print " -> "
      rp.calculate_nearest_ways_point
      rp.cached_costs = id_hash[rp.id.to_s].map do |k, v|
        print "*"
        [RoutePoint.find(k), v]
      end.to_h
    end
    puts ""
  end

  def self.walking_distance(a, b)
    id1 = a.nearest_ways_point
    id2 = b.nearest_ways_point

    sql = "
    SELECT SUM(ST_Length(the_geom::geography))
    FROM pgr_dijkstra('
      SELECT gid as id, source, target, cost, reverse_cost FROM routing.ways
      WHERE the_geom && ST_Expand(
      (SELECT ST_Collect(the_geom) FROM routing.ways_vertices_pgr WHERE id IN (#{id1}, #{id2})), 0.007)'
    , #{id1}, #{id2}, false) dij
    LEFT JOIN routing.ways ON dij.node = gid"
    res = ApplicationRecord.connection.execute(sql).values[0][0]
    res || a.point.position.distance(b.point.position)
  end

  def self.closest_street_vertex(point)
    sql = "
SELECT id FROM routing.ways_vertices_pgr
WHERE the_geom::geography <-> st_point(#{point.lon}, #{point.lat})::geography < 300
ORDER BY the_geom <-> st_point(#{point.lon}, #{point.lat})::geography
LIMIT 1"
    ApplicationRecord.connection.execute(sql).values[0][0]
  end

  def self.heuristic(a, b)
    if a == RoutePoint && b == RoutePoint && a.route_id == b.route_id
      a.point.position.distance(b.point.position)
    else
      5*a.point.position.distance(b.point.position)
    end
  end

  def self.a_star(source, target)
    maxint = (2**(0.size * 8 -2) -1)
    costs = {}
    previous = {}
    nodes = PriorityQueue.new

    ([source, target] + @point_cache).each do |rp|
      if rp == source
        costs[rp] = 0
        nodes[rp] = 0
      else
        costs[rp] = maxint
        nodes[rp] = maxint
      end
      previous[rp] = nil
    end

    while nodes.length > 0
      current = nodes.delete_min_return_key

      if current == target
        path = []
        while previous[current]
          path.unshift current
          current = previous[current]
        end
        return path[0..-2]
      end

      break if current.nil? || costs[current] == maxint

      if current == source
        puts "start"
      elsif current == target
        puts "finish"
      else
        puts "#{current.id}"
      end
      current.neighbors(target, previous[current]).each do |new|
        alt = costs[current] + current.cost_to(new)
        if alt < costs[new]
          costs[new] = alt + heuristic(target, new)
          previous[new] = current
          nodes[new] = alt
        end
      end
      puts ""
    end

    []
  end

  def self.trace_route(start, finish)
    routes = Route.find_by_sql(['
SELECT
  r.*,
  rp1.order as rp1_order,
  rp2.order as rp2_order
FROM routes r

JOIN route_points rp1 ON rp1.route_id = r.id
JOIN points p1 ON rp1.point_id = p1.id

JOIN route_points rp2 ON rp2.route_id = r.id
JOIN points p2 ON rp2.point_id = p2.id

WHERE
rp2.order > rp1.order AND
p1.waypoint = FALSE AND p2.waypoint = FALSE AND
st_distance(p1.position, st_point(?, ?)) < 500 AND
st_distance(p2.position, st_point(?, ?)) < 500

ORDER BY st_distance(p1.position, st_point(?, ?)) + st_distance(p2.position, st_point(?, ?))
',
        start.point.position.lon, start.point.position.lat, finish.point.position.lon, finish.point.position.lat,
        start.point.position.lon, start.point.position.lat, finish.point.position.lon, finish.point.position.lat
    ])
    if routes.count > 0
      route = routes[0]
      RoutePoint.where(route: route).where('"order" >= ? AND "order" <= ?', route.rp1_order, route.rp2_order).order('"order" ASC')
    else
      a_star(start, finish)
    end
  end

  def self.route_between(start, finish)
    begin
      RubyProf.start
      old_level = ActiveRecord::Base.logger.level
      ActiveRecord::Base.logger.level = 1
      load_point_cache if @point_cache.empty?

      route = trace_route(start, finish)

      ActiveRecord::Base.logger.level = old_level
    ensure
      res = RubyProf.stop
      RubyProf::GraphHtmlPrinter.new(res).print(File.open("/tmp/report.html", "w"), min_percent: 1)
    end
    route.group_by{|p| p.route_id}.map do |route_id, group|
      group = group.sort_by { |rp| rp.order } # ????
      sql = <<-EOF
SELECT st_astext(st_makeline(geom)::geography) as route_line
FROM
(
  SELECT (st_dumppoints(route)).geom FROM routes WHERE id = #{route_id} LIMIT (#{group[-1].polyline_index - group[0].polyline_index} + 1) OFFSET #{group[0].polyline_index}
) foo
      EOF
      path = RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(Route.connection.execute(sql).values[0][0])
      {
          start_point: start,
          end_point: finish,
          points: group.map(&:point),
          route: group[0].route,
          route_path: path&.points&.map do |p|
            p = RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(p.to_s)
            {lat: p.lat, lng: p.lon}
          end
      }
    end
  end

  def self.test_route
    boicy = VirtualPoint.new -54.577825, -25.546901
    rodo  = VirtualPoint.new -54.562939, -25.520758
    route_between boicy, rodo
  end
end
