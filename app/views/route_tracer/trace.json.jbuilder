json.array!(@path) do |step|
  json.stops(step[:points]) do |point|
    json.name point.name
    json.lat point.position.lat
    json.lng point.position.lon
  end

  json.route do
    json.line do
      json.extract! step[:route].line, :identifier, :name
    end
    json.extract! step[:route], :name
  end

  json.route_path step[:route_path]
end