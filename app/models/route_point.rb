class RoutePoint < ApplicationRecord
  belongs_to :route
  belongs_to :point

  # TODO: não deixar como vizinho um ponto que parta da mesma origem
  def neighbors(destination, previous)
    if previous && previous.class == RoutePoint && previous.route_id != self.route_id
      neighbors = RoutePoint
                      .joins(:point)
                      .joins(:route)
                      .where('routes.destination <> ?', self.route.origin)
                      .where('(route_id = ? AND "order" = ?)', self.route_id, self.order + 1)
    else
      neighbors = RoutePoint
                      .joins(:point)
                      .joins(:route)
                      .where('routes.destination <> ?', self.route.origin)
                      .where('(route_id <> ? AND st_distance(st_point(?, ?)::geography, points.position) < 250) OR (route_id = ? AND "order" = ?)',
                             self.route_id, self.point.position.lon, self.point.position.lat, self.route_id, self.order + 1)
    end

    neighbors += [destination] if destination && !self.point.waypoint && self.point.position.distance(destination.point.position) < 500
    neighbors
  end

  def cost_to target
  	if target.class == VirtualPoint
      # para evitar que pulemos adiante, precisamos saber qual o RoutePoint atual ou seguinte que está mais próximo do
      # VirtualPoint. Daí a distância é a distância até o tal RoutePoint + a distância caminhando
      rp = RoutePoint.joins(:point).where(points: {waypoint: false}, route: self.route).where('"order" >= ?', self.order).sort_by{|rp| rp.point.position.distance(target.point.position)}.first
      distance = if rp.id == self.id
                   0
                 else
                   sql = <<-EOF
SELECT st_length(st_makeline(geom)::geography) as route_line
FROM
(
  SELECT (st_dumppoints(route)).geom FROM routes WHERE id = #{self.route_id} LIMIT (#{rp.polyline_index} + 1) OFFSET #{self.polyline_index}
) foo
                   EOF
                   Route.connection.execute(sql).values[0][0]
                 end
  		distance + 7*self.point.position.distance(target.point.position)
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
      500 + 5*self.point.position.distance(target.point.position)
    end
  end

  def self.closest_to lon, lat
    joins(:point).where(points: {waypoint: false}).where('st_distance(st_point(?, ?)::geography, points.position::geography) < 3000', lon, lat)
        .order(sanitize_sql("st_distance(st_point(#{lon}, #{lat})::geography, points.position::geography)"))
        .limit(1)&.first
  end
end
