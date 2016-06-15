class AddPlaceToTimetable < ActiveRecord::Migration[5.0]
  def up
    add_column :timetables, :start_place_id, :integer
    add_column :timetables, :end_place_id, :integer
    add_foreign_key :timetables, :places, column: :start_place_id
    add_foreign_key :timetables, :places, column: :end_place_id
    add_reference :timetables, :line, foreign_key: true
    remove_reference :timetables, :route
    remove_column :timetables, :time
  end
end
