class Route < ApplicationRecord
  belongs_to :parent_route, class_name: 'Route', required: false
  belongs_to :line
  has_many :child_routes, class_name: 'Route', foreign_key: :parent_route_id
  has_many :timetables
  has_many :route_points, -> { order('"order" ASC') }, dependent: :destroy
  has_many :points, through: :route_points

  validates :origin, :destination, presence: true

  def route_lonlat
    self.route&.points&.map{|x| {lat: x.y, lon: x.x}}
  end

  def name
    "#{self.origin} - #{self.destination}" + (self.observation ? " (#{self.observation})" : '')
  end

  def route_length
    self.route ? RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(self.route.to_s).length : 0
  end
end
