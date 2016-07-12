class Route < ApplicationRecord
  belongs_to :line
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

  def self.route_segment(id, starting, ending)
    sql = "
SELECT ST_AsText(ST_Makeline(geom)::geography)
FROM
(
  SELECT (ST_DumpPoints(route)).geom FROM routes WHERE id = #{sanitize_sql(id)} LIMIT #{sanitize_sql(ending - starting + 1)} OFFSET #{sanitize_sql(starting)}
) a"
    RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(self.connection.execute(sql).values[0][0])
  end
end
