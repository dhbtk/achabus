require 'ruby-prof'
require 'priority_queue'

class RouteTracer
  @point_cache = []

  def self.calculate_point_cache
    @point_cache.clear
    i = 1
    count = RoutePoint.count
    RoutePoint.all.includes(:point).each do |rp|
      puts "#{i}/#{count}..."
      rp.cached_costs = {}
      rp.neighbors(nil, nil).each do |neighbor|
        print "*"
        rp.cached_costs[neighbor] = rp.cost_to neighbor
      end
      puts ""
      @point_cache << rp
      i += 1
    end
    save_point_cache
  end

  def self.save_point_cache
    serialized = @point_cache.map{|rp| [rp.id, rp.cached_costs.map{|n,c| [n.id, c]}.to_h]}.to_h
    File.write('/tmp/achabus-point-cache.json', serialized.to_json)
  end

  def self.load_point_cache
    begin
      id_hash = JSON.parse(File.read('/tmp/achabus-point-cache.json'))
    rescue
      calculate_point_cache && save_point_cache && load_point_cache
      return
    end
    puts "Carregando..."
    @point_cache = RoutePoint.includes(:route).find(id_hash.keys)
    @point_cache.each do |rp|
      print "-> "
      rp.cached_costs = id_hash[rp.id.to_s].map do |k, v|
        print "*"
        [RoutePoint.includes(:route).find(k), v]
      end.to_h
      puts ""
    end
  end

  def self.walking_distance(a, b)
    seg1 = a.closest_street_segment
    seg2 = b.closest_street_segment

    starts = seg1.get_points
    targets = seg2.get_points

    return a.point.position.distance(b.point.position) if seg1.gid == seg2.gid # FIXME!

    sql = "
    SELECT * FROM pgr_dijkstraCost(
      'SELECT gid as id, source, target, st_length(the_geom::geography) as cost, st_length(the_geom::geography) as reverse_cost FROM routing.ways
      WHERE the_geom && ST_Expand(
      (SELECT ST_Collect(the_geom) FROM routing.ways_vertices_pgr WHERE id IN (#{(starts + targets).join(', ')})), 0.01)
',
      ARRAY[#{starts.join(', ')}], ARRAY[#{targets.join(', ')}], false)
    "
    res = ApplicationRecord.connection.execute(sql).values

    res.map do |line| # start_vid, end_vid, cost
      cost = line[2]
      if line[0] == seg1.source
        cost += seg1.closest_point_distance + seg1.source_distance
      elsif line[0] == seg1.target
        cost += seg1.closest_point_distance + seg1.target_distance
      end
      if line[1] == seg2.source
        cost += seg2.closest_point_distance + seg2.source_distance
      elsif line[1] == seg2.target
        cost += seg2.closest_point_distance + seg2.target_distance
      end
      cost
    end.sort[0]
  end

  # Aqui temos um modelo simples para aceleração/desaceleração de um ônibus.
  # Fazemos de conta que ônibus têm aceleração constante, 1 m/s, até chegarem a 11 m/s (39,6 km/h).
  # Após ficarem pelo menos 330 m nessa velocidade (30s) eles aceleram para 17 m/s a 1 m/s², demorando 6 segundos.
  # Depois disso, independentemente da velocidade que estão, freiam a -1 m/s² para parar no próximo ponto.
  #
  # A distância de aceleração é igual a integral da aceleração sobre o tempo. Como temos aceleração linear, para a
  # aceleração inicial e desaceleração final temos um triângulo, e para a aceleração no meio do percurso, temos um
  # quadrilátero.
  # @param [Float] length o percurso entre um ponto e outro
  # @return [Float] o tempo em segundos
  def self.driving_time(length)
    length = length.to_f
    if length < 800
      top_speed = 7.0 # 39,6 km/h
    else
      top_speed = 10.0 # 61,2 km/h
    end
    # A área máxima em que o gráfico é apenas um triângulo e não um trapézio.
    triangle_area = top_speed**2
    if length <= triangle_area
      Math.sqrt(2*length)*Math.sqrt(2)
    else
      rectangle_area = length - triangle_area
      rectangle_area/top_speed + 2*top_speed
    end
  end

# Aqui assumimos que pessoas andam em velocidade constante.
# A wikipédia diz que a maioria das pessoas anda a 1,4 m/s, então vamos usar este valor.
# t = d/v
#
# @param [RoutePoint||VirtualPoint] a ponto A
# @param [RoutePoint||VirtualPoint] b ponto B
# @return [Float] o tempo em segundos
  def self.walking_time(a, b)

    walking_distance(a, b)/1.4
  end

  def self.closest_street_vertex(point)
    sql = "
SELECT id FROM routing.ways_vertices_pgr
WHERE the_geom::geography <-> st_point(#{point.lon}, #{point.lat})::geography < 300
ORDER BY the_geom <-> st_point(#{point.lon}, #{point.lat})::geography
LIMIT 1"
    ApplicationRecord.connection.execute(sql).values[0][0]
  end

  def self.walking_path(a, b)
    id1 = closest_street_vertex a
    id2 = closest_street_vertex b

    sql = "
    SELECT st_asText(the_geom::geography), st_asText(st_reverse(the_geom)::geography) as flip_geom, source, target
    FROM pgr_dijkstra('
      SELECT gid as id, source, target, cost, reverse_cost FROM routing.ways
      WHERE the_geom && ST_Expand(
      (SELECT ST_Collect(the_geom) FROM routing.ways_vertices_pgr WHERE id IN (#{id1}, #{id2})), 0.007)'
    , #{id1}, #{id2}, false) dij
    LEFT JOIN routing.ways ON dij.node = gid"
    source = id1
    points = []
    ApplicationRecord.connection.execute(sql).values.each do |row|
      line = row[0]
      if source != row[2]
        line = row[1]
        source = row[2]
      else
        source = row[3]
      end
      points += RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(line).points
    end
    ls = "LINESTRING (#{points.uniq.map{|p| "#{p.lon} #{p.lat}"}.join(',')})"
    puts ls
    points.empty? ? OpenStruct.new({points: []}) : RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(ls)
  end

  def self.antecessors_to(target, previous)
    path = []
    current = target
    while previous[current]
      path.unshift current
      current = previous[current]
    end
    path
  end

  def self.dijkstra(source, target)
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
        return antecessors_to(current, previous)[0..-2]
      end

      break if current.nil? || costs[current] == maxint

      current.neighbors(target, antecessors_to(current, previous)).each do |new|
        alt = costs[current] + current.cost_to(new)
        if alt < costs[new]
          costs[new] = alt
          previous[new] = current
          nodes[new] = alt
        end
      end
    end

    []
  end

  def self.trace_route(start, finish)
    dijkstra(start, finish)
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
    File.open('/tmp/route-trace.txt', 'w') do |f|
      f << "DISCRIMINAÇÃO DOS PONTOS\n\n"
      route.each do |rp|
        f << "%s - %s/%s\n  %s\n" % [rp.route.line.identifier, rp.route.origin, rp.route.destination, rp.point.name]
      end
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
    old_level = ActiveRecord::Base.logger.level
    ActiveRecord::Base.logger.level = 1
    boicy = VirtualPoint.new -54.577825, -25.546901
    rodo  = VirtualPoint.new -54.562939, -25.520758
    ActiveRecord::Base.logger.level = old_level
    route_between boicy, rodo
  end
end
