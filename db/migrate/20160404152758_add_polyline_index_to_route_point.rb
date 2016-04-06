class AddPolylineIndexToRoutePoint < ActiveRecord::Migration[5.0]
  def change
    add_column :route_points, :polyline_index, :integer
  end
end
