class VirtualPoint
	def initialize(lon, lat)
		@point = RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt("POINT (#{lon} #{lat})")
	end
	def neighbors(destination)
		RoutePoint.joins(:point).where('st_distance(st_point(?, ?)::geography, points.position) < 500', @point.lon, @point.lat)
	end

	def cost_to target
		@point.distance(target.point.position)*5
	end

	def point
		OpenStruct.new({position: @point})
	end
end
