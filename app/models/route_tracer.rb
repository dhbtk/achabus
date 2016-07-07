require 'open-uri'

class RouteTracer
  def self.walking_distance(a, b)
    uri = URI("http://router.project-osrm.org/route/v1/foot/#{a.point.position.lon},#{a.point.position.lat};#{b.point.position.lon},#{b.point.position.lat}?geometries=geojson")

    JSON.parse(uri.read)['routes'][0]['distance']
  rescue
    nil
  end

  def self.dijkstra(start, finish)
    maxint = (2**(0.size * 8 -2) -1)
    costs = {}
    previous = {}
    nodes = {}

    ([start, finish] + RoutePoint.all.includes(:point)).each do |rp|
      if rp == start
        costs[rp] = 0
        nodes[rp] = 0
      else
        costs[rp] = maxint
        nodes[rp] = maxint
      end
      previous[rp] = nil
    end

    while nodes.length > 0
      smallest = nodes.select{|_, x| x == nodes.values.min}.keys[0]
      nodes.delete(smallest)

      if smallest == finish
        path = []
        while previous[smallest]
          path.unshift smallest
          smallest = previous[smallest]
        end
        return path[0..-2]
      end

      break if smallest.nil? || costs[smallest] == maxint

      smallest.neighbors(finish, previous[smallest]).each do |n|
        alt = costs[smallest] + smallest.cost_to(n)
        if alt < costs[n]
          costs[n] = alt
          previous[n] = smallest
          nodes[n] = alt
        end
      end
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
      dijkstra(start, finish)
    end
  end

  def self.route_between(start, finish)
    old_level = ActiveRecord::Base.logger.level
    ActiveRecord::Base.logger.level = 1

    route = trace_route(start, finish)

    ActiveRecord::Base.logger.level = old_level
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
    walking_distance boicy, rodo
  end
end
