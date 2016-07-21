json.route do
  json.array!(@route[:route]) do |step|
    json.stops(step[:points]) do |point|
      json.name point.name
      json.wkt point.position.to_s
    end

    json.route do
      json.line do
        json.extract! step[:route].line, :identifier, :name
      end
      json.extract! step[:route], :name
    end

    json.route_path step[:route_path]
    json.total_time step[:total_time]
  end
end
json.walking_paths @route[:walking_paths]