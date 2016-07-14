class RoutePoint < ApplicationRecord
  belongs_to :route
  belongs_to :point

  attr_accessor :cached_costs

  # TODO: não deixar como vizinho um ponto que parta da mesma origem
  def neighbors(destination, antecessors)
    if cached_costs && !cached_costs.empty?
      neighbors = cached_costs.keys
      previous = antecessors[-2]
      if previous && previous.class == RoutePoint && previous.route_id != self.route_id
        neighbors = neighbors.select do |neighbor|
          neighbor.route_id == self.route_id
        end
      else
        antecessor_route_ids = antecessors.map{|x| x.route.origin + x.route.destination}.uniq - [self.route.origin + self.route.destination]
        neighbors = neighbors.select do |neighbor|
          !antecessor_route_ids.include?(neighbor.route.origin + neighbor.route.destination)
        end
      end
    else
      neighbors = RoutePoint
                      .joins(:point)
                      .joins(:route)
                      .where('routes.destination <> ?', self.route.origin)
                      .where(points: {waypoint: false})
                      .where('(routes.origin <> ? AND route_id <> ? AND st_distance(st_point(?, ?)::geography, points.position) < 250)',
                                    self.route.origin, self.route_id, self.point.position.lon, self.point.position.lat)
      neighbors += RoutePoint.joins(:point).where(route: self.route, points: {waypoint: false}).where('"order" > ?', self.order).order('"order" ASC').limit(1)
    end
    neighbors += [destination] if destination && !self.point.waypoint && self.point.position.distance(destination.point.position) < 500
    neighbors
  end

  def cost_to target
    if cached_costs && target.class != VirtualPoint && cached_costs[target]
      cached_costs[target]
    else
      if target.class == RoutePoint && target.route_id == self.route_id
        if target.order > self.order
          RouteTracer.driving_time(Route.route_segment(self.route_id, self.polyline_index, target.polyline_index)&.length || 0)
        else
          raise ArgumentError, 'Não podemos voltar para trás'
        end
      else
        30 + RouteTracer.walking_time(self, target)
      end
    end
  end

  def nearest_ways_point
    super || calculate_nearest_ways_point
  end

  def calculate_nearest_ways_point
    lon = point.position.lon
    lat = point.position.lat
    sql ="SELECT id FROM routing.ways_vertices_pgr WHERE the_geom::geography <-> ST_Point(#{lon}, #{lat})::geography < 300
	ORDER BY the_geom::geography <-> ST_Point(#{lon}, #{lat})::geography LIMIT 1"
    id = ApplicationRecord.connection.execute(sql).values[0][0]
    self.update(nearest_ways_point: id)
    id
  end

  def self.closest_to lon, lat
    joins(:point).where(points: {waypoint: false}).where('st_distance(st_point(?, ?)::geography, points.position::geography) < 3000', lon, lat)
        .order(sanitize_sql("st_distance(st_point(#{lon}, #{lat})::geography, points.position::geography)"))
        .limit(1)&.first
  end
end
