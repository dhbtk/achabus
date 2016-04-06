json.array!(@route_points) do |route_point|
  json.extract! route_point, :id, :route_id, :point_id, :order, :polyline_index
  json.url route_point_url(route_point, format: :json)
end
