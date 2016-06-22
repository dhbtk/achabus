json.array!(@path) do |step|
  json.stops(step[:points]) do |point|
    json.lat point.position.lat
    json.lng point.position.lon
  end

  json.route step[:route]
end