class RoutePoint < ApplicationRecord
  belongs_to :route
  belongs_to :point

  def neighbors
    RoutePoint.where('route_id <> ? OR "order" > ?', self.route_id, self.order).joins(:point)
  end

  def cost_to target

  end
end
