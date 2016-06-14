class Route < ApplicationRecord
  belongs_to :parent_route, class_name: 'Route', required: false
  belongs_to :line
  has_many :child_routes, class_name: 'Route', foreign_key: :parent_route_id
  has_many :times, class_name: 'Timetable'
  has_many :route_points, -> { order('"order" ASC') }
  has_many :points, through: :route_points
end
