class VirtualPoint

  def initialize(lon, lat)
    @point = RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt("POINT (#{lon} #{lat})")
    @cached_costs = {}
    cached_costs = {}
    neighbors(nil, nil).each do |neighbor|
      cached_costs[neighbor] = cost_to(neighbor)
    end
    @cached_costs = cached_costs
  end

  def neighbors(destination, previous)
    if !@cached_costs.empty?
      @cached_costs.keys
    else
      RoutePoint.joins(:point).where(points: {waypoint: false}).where('st_distance(st_point(?, ?)::geography, points.position) < 500', @point.lon, @point.lat)
    end
  end

  def cost_to target
    RouteTracer.walking_time(self, target)
  end

  def point
    OpenStruct.new({position: @point})
  end
end
