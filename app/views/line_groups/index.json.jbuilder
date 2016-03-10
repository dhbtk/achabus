json.array!(@line_groups) do |line_group|
  json.extract! line_group, :id, :name, :city
  json.url line_group_url(line_group, format: :json)
end
