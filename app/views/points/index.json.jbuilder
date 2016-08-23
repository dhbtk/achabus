json.array!(@points) do |point|
  json.extract! point, :id, :position, :heading, :name, :waypoint
  json.coords [point.position.lon, point.position.lat]
  json.url point_url(point, format: :json)
end
