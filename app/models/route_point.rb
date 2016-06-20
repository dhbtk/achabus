require 'priority_queue'

class RoutePoint < ApplicationRecord
  belongs_to :route
  belongs_to :point

  def neighbors
    RoutePoint.where('(route_id <> ? AND st_distance(st_point(?, ?)::geography, points.position::geography) < 300) OR (route_id = ? AND "order" = ?)',
                     self.route_id, self.point.position.lon, self.point.position.lat, self.route_id, self.order + 1).joins(:point)
  end

  def cost_to target
    if target.route_id == self.route_id
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
        1000 + 100*self.point.position.distance(target.point.position)
      end
    else
      200 + 20*self.point.position.distance(target.point.position)
    end
  end

  def self.closest_to lon, lat
    joins(:point).where('st_distance(st_point(?, ?)::geography, points.position::geography) < 300', lon, lat)
        .order(sanitize_sql("st_distance(st_point(#{lon}, #{lat})::geography, points.position::geography)"))
        .limit(1)&.first
  end

  def self.dijkstra(start, finish)
    maxint = (2**(0.size * 8 -2) -1)
    costs = {}
    previous = {}
    nodes = {}

    pluck(:id).each do |rp|
      if rp == start.id
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

      if smallest == finish.id
        path = []
        while previous[smallest]
          path.unshift smallest
          smallest = previous[smallest]
        end
        return path
      end

      break if smallest.nil? || costs[smallest] == maxint

      smallest = find(smallest)

      smallest.neighbors.each do |n|
        alt = costs[smallest.id] + smallest.cost_to(n)
        if alt < costs[n.id]
          costs[n.id] = alt
          previous[n.id] = smallest.id
          nodes[n.id] = alt
        end
      end
    end

    costs
  end

  def self.route_between(start, finish)
    path = RoutePoint.find(dijkstra(start, finish)).group_by{|p| p.route_id}.map do |route_id, group|
      sql = <<-EOF
SELECT st_astext(st_makeline(geom)::geography) as route_line
FROM
(
  SELECT (st_dumppoints(route)).geom FROM routes WHERE id = #{route_id} LIMIT (#{group[-1].polyline_index} + 1) OFFSET #{group[0].polyline_index}
) foo
      EOF
      {
          start_point: group[0].point,
          end_point: group[-1].point,
          points: group.map(&:point),
          route: RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(Route.connection.execute(sql).values[0][0])
      }
    end
  end

  def self.test_route
    old_logger = ActiveRecord::Base.logger
    ActiveRecord::Base.logger = nil
    boicy = closest_to -54.577825, -25.546901
    rodo  = closest_to -54.562939, -25.520758
    route_between boicy, rodo
  end
end
