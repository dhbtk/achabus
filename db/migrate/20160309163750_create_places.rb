class CreatePlaces < ActiveRecord::Migration[5.0]
  def change
    create_table :places do |t|
      t.st_point :position, geographical: true
      t.string :name

      t.timestamps
    end
  end
end
