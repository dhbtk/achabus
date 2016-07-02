json.content(@lines) do |line|
  json.extract! line, :id, :short_name, :name, :line_group_id, :itinerary_link, :timetable_link
  json.line_group do
    json.extract! line.line_group, :name, :city
  end
  json.routes(line.routes) do |route|
    json.extract! route, :id, :name, :short_name
  end
  json.url line_url(line, format: :json)
end
json.page params[:page]
json.total @lines.total_count