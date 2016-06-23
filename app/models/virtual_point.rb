class VirtualPoint
	def initialize(lon, lat)
		@point = RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt("POINT (#{lon} #{lat})")
	end
	def neighbors(destination)
		RoutePoint.where('st_distance(st_point(?, ?)::geography, points.position::geography) < 1000', @point.lon, @point.lat).joins(:point)
	end

	def cost_to target
		@point.distance(target.point.position)
	end

	def point
		OpenStruct.new({position: @point})
	end
end
