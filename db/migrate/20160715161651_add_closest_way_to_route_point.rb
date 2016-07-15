class AddClosestWayToRoutePoint < ActiveRecord::Migration[5.0]
  def change
    add_column :route_points, :closest_way, :integer

    add_foreign_key :route_points, 'routing.ways', column: :closest_way, primary_key: :gid
  end
end
