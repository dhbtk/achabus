class AddPassThroughToRoutePoint < ActiveRecord::Migration[5.0]
  def change
    add_column :route_points, :pass_through, :boolean, default: false
  end
end
