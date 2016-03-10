json.array!(@routes) do |route|
  json.extract! route, :id, :parent_route_id, :name, :short_name, :route_path_markers, :route, :line_id
  json.url route_url(route, format: :json)
end
