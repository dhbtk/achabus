class CreateRoutes < ActiveRecord::Migration[5.0]
  def change
    create_table :routes do |t|
      t.integer :parent_route_id
      t.string :name
      t.string :short_name
      t.line_string :route_path_markers
      t.line_string :route

      t.timestamps
    end
    add_foreign_key :routes, :routes, column: :parent_route_id
  end
end
