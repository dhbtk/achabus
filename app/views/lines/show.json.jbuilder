json.extract! @line, :id, :identifier, :name, :line_group_id, :created_at, :updated_at, :itinerary_link, :timetable_link, :path

json.line_group do
  json.name @line.line_group.name
  json.city @line.line_group.city
end

json.routes do
  json.array!(@line.routes) do |route|
    json.extract! route, :id, :created_at, :updated_at, :origin, :destination, :route, :route_length, :route_lonlat, :name, :observation
  end
end

json.grouped_routes do
  @line.routes.group_by{|r| r.origin.hash + r.destination.hash}.map{|k, v| ["#{v[0].origin} → #{v[0].destination}", v]}.to_h.each do |k, v|
    v = v.sort_by do |r1|
      [r1.origin == v[0].origin ? 0 : 1, r1.observation || '']
    end
    json.set! k do
      json.array!(v) do |route|
        json.extract! route, :id, :created_at, :updated_at, :origin, :destination, :route, :route_length, :route_lonlat, :name, :observation
      end
    end
  end
end