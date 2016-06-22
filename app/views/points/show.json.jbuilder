json.extract! @point, :id, :position, :heading, :name, :notable_name, :notable, :waypoint, :created_at, :updated_at
json.lat @point.position.lat
json.lng @point.position.lon