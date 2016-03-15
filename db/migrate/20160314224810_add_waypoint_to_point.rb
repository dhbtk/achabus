class AddWaypointToPoint < ActiveRecord::Migration[5.0]
  def change
    add_column :points, :waypoint, :boolean, default: false
  end
end
