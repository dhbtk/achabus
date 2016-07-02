@timetables.each do |k, v|
  json.set! k do
    v.each do |route, times|
      json.set! route do
        json.array! times do |time|
          json.extract! time, :id, :sunday, :monday, :tuesday, :wednesday, :thursday, :friday, :saturday, :route_id, :time
          json.observation time.route.observation
        end
      end
    end
  end
end