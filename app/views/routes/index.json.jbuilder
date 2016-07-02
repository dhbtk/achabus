json.array!(@routes) do |route|
  json.extract! route, :id, :name, :observation, :route, :line_id
  json.url route_url(route, format: :json)
end
