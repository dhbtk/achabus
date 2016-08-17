json.extract! @point, :id, :position, :heading, :name, :waypoint, :created_at, :updated_at
json.lat @point.position.lat
json.lng @point.position.lon