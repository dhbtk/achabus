class RouteTracer
  def self.dijkstra(start, finish)
    maxint = (2**(0.size * 8 -2) -1)
    costs = {}
    previous = {}
    nodes = {}

    ([start, finish] + RoutePoint.all).each do |rp|
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

      smallest.neighbors(finish).each do |n|
        alt = costs[smallest] + smallest.cost_to(n)
        if alt < costs[n]
          costs[n] = alt
          previous[n] = smallest
          nodes[n] = alt
        end
      end
    end

    costs
  end

  def self.find_path(start, finish)
    if start.position.point.distance(finish.position.point) < 500
      # Vá caminhando!
      []
    else
      paths = {}
      path = []

    end
  end

  def self.route_between(start, finish)
    dijkstra(start, finish).group_by{|p| p.route_id}.map do |route_id, group|
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