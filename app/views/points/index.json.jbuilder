json.array!(@points) do |point|
  json.extract! point, :id, :position, :heading, :name, :notable_name, :notable, :waypoint
  json.url point_url(point, format: :json)
end
