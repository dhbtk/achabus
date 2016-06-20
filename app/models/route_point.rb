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
        1000*self.point.position.distance(target.point.position)
      end
    else
      20*self.point.position.distance(target.point.position)
    end
  end

  def self.closest_to lon, lat
    joins(:point).where('st_distance(st_point(?, ?)::geography, points.position::geography) < 300', lon, lat)
        .order(sanitize_sql("st_distance(st_point(#{lon}, #{lat})::geography, points.position::geography)"))
        .limit(1)&.first
  end

  def self.route_between(start, finish)
    maxint = (2**(0.size * 8 -2) -1)
    costs = {}
    previous = {}
    nodes = PriorityQueue.new

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

    puts costs[start.id]

    while nodes
      smallest = nodes.delete_min_return_key

      break if smallest.nil? || costs[smallest] == maxint

      smallest = find(smallest)

      smallest.neighbors.each do |n|
        alt = costs[n.id] + smallest.cost_to(n)
        if alt < costs[n.id]
          costs[n.id] = alt
          previous[n.id] = smallest
          nodes[n.id] = alt
        end
      end
    end

    costs
  end
end
