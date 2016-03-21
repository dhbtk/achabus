class ChangePointHeadingType < ActiveRecord::Migration[5.0]
  def up
    remove_column :points, :heading
    add_column :points, :heading, :decimal, precision: 16, scale: 5
  end
end
