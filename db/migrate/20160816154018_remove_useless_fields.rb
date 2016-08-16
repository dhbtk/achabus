class RemoveUselessFields < ActiveRecord::Migration[5.0]
  def change
    remove_column :points, :notable_name, :text
    remove_column :points, :notable, :boolean
    remove_column :route_points, :pass_through, :boolean
    remove_column :route_points, :closest_way, :integer
  end
end
