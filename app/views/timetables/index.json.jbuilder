json.array!(@timetables) do |timetable|
  json.extract! timetable, :id, :sunday, :monday, :tuesday, :wednesday, :thursday, :friday, :saturday, :route_id, :time
  json.url timetable_url(timetable, format: :json)
end
