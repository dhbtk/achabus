class AddNearestWaysPointToRoutePoint < ActiveRecord::Migration[5.0]
  def change
    add_column :route_points, :nearest_ways_point, :integer
  end
end
