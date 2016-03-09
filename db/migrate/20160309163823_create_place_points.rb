class CreatePlacePoints < ActiveRecord::Migration[5.0]
  def change
    create_table :place_points do |t|
      t.references :place, foreign_key: true
      t.references :point, foreign_key: true

      t.timestamps
    end
  end
end
