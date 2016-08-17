json.array!(@points) do |point|
  json.extract! point, :id, :position, :heading, :name, :waypoint
  json.url point_url(point, format: :json)
end
