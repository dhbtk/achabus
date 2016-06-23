class RoutePoint < ApplicationRecord
  belongs_to :route
  belongs_to :point

  def neighbors(destination = nil)
    neighbors = RoutePoint.where('(route_id <> ? AND st_distance(st_point(?, ?)::geography, points.position::geography) < 500) OR (route_id = ? AND "order" = ?)',
                     self.route_id, self.point.position.lon, self.point.position.lat, self.route_id, self.order + 1).joins(:point)
    neighbors += [destination] if destination && self.point.position.distance(destination.point.position) < 1000
    neighbors
  end

  def cost_to target
  	if target.class == VirtualPoint
  		self.point.position.distance(target.point.position)
    elsif target.route_id == self.route_id
      if target.order > self.order
        sql = <<-EOF
SELECT st_length(st_makeline(geom)::geography) as route_line
FROM
(
  SELECT (st_dumppoints(route)).geom FROM routes WHERE id = #{self.route_id} LIMIT (#{target.polyline_index} + 1) OFFSET #{self.polyline_index}
) foo
        EOF
        Route.connection.execute(sql).values[0][0]
      else
        raise ArgumentError, 'Não podemos voltar para trás'
      end
    else
      500 + 120*self.point.position.distance(target.point.position)
    end
  end

  def self.closest_to lon, lat
    joins(:point).where('st_distance(st_point(?, ?)::geography, points.position::geography) < 3000', lon, lat)
        .order(sanitize_sql("st_distance(st_point(#{lon}, #{lat})::geography, points.position::geography)"))
        .limit(1)&.first
  end

  def self.dijkstra(start, finish)
    maxint = (2**(0.size * 8 -2) -1)
    costs = {}
    previous = {}
    nodes = {}

    ([start, finish] + all).each do |rp|
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

  def self.route_between(start, finish)
    path = dijkstra(start, finish).group_by{|p| p.route_id}.map do |route_id, group|
      sql = <<-EOF
SELECT st_astext(st_makeline(geom)::geography) as route_line
FROM
(
  SELECT (st_dumppoints(route)).geom FROM routes WHERE id = #{route_id} LIMIT (#{group[-1].polyline_index - group[0].polyline_index} + 1) OFFSET #{group[0].polyline_index}
) foo
      EOF
      {
          start_point: start,
          end_point: finish,
          points: group.map(&:point),
          route: RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(Route.connection.execute(sql).values[0][0])&.points&.map{|p|
            p = RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(p.to_s)
            {lat: p.lat, lng: p.lon}
          }
      }
    end
  end

  def self.test_route
    old_logger = ActiveRecord::Base.logger
    ActiveRecord::Base.logger = nil
    boicy = VirtualPoint.new -54.577825, -25.546901
    rodo  = VirtualPoint.new -54.562939, -25.520758
    route_between boicy, rodo
  end
end
