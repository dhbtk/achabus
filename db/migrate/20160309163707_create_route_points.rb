class CreateRoutePoints < ActiveRecord::Migration[5.0]
  def change
    create_table :route_points do |t|
      t.references :route, foreign_key: true
      t.references :point, foreign_key: true
      t.integer :order

      t.timestamps
    end
  end
end
