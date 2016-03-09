class CreateLines < ActiveRecord::Migration[5.0]
  def change
    create_table :lines do |t|
      t.string :short_name
      t.string :name
      t.references :line_group, foreign_key: true

      t.timestamps
    end
  end
end
