class CreateTimetables < ActiveRecord::Migration[5.0]
  def change
    create_table :timetables do |t|
      t.references :route, foreign_key: true
      t.time :time

      t.timestamps
    end
  end
end
