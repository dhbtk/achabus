class AddDaysToTimetable < ActiveRecord::Migration[5.0]
  def change
    add_column :timetables, :sunday, :boolean
    add_column :timetables, :monday, :boolean
    add_column :timetables, :tuesday, :boolean
    add_column :timetables, :wednesday, :boolean
    add_column :timetables, :thursday, :boolean
    add_column :timetables, :friday, :boolean
    add_column :timetables, :saturday, :boolean
  end
end
