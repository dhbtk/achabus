json.extract! @route_point, :id, :route_id, :point_id, :order, :polyline_index, :created_at, :updated_at

json.point do
  json.extract! @route_point.point, :id, :position, :heading, :name, :notable_name, :notable, :waypoint, :created_at, :updated_at
  json.lat @route_point.point.position.lat
  json.lng @route_point.point.position.lon
end