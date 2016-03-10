json.array!(@lines) do |line|
  json.extract! line, :id, :short_name, :name, :line_group_id
  json.url line_url(line, format: :json)
end
