class RemoveLineFromTimetables < ActiveRecord::Migration[5.0]
  def change
    remove_reference :timetables, :line, foreign_key: true
    add_reference :timetables, :route, foreign_key: true
  end
end
