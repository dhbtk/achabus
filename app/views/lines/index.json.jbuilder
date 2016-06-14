json.array!(@lines) do |line|
  json.extract! line, :id, :short_name, :name, :line_group_id, :itinerary_link, :timetable_link
  json.url line_url(line, format: :json)
end
