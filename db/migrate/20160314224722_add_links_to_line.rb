class AddLinksToLine < ActiveRecord::Migration[5.0]
  def change
    add_column :lines, :timetable_link, :string
    add_column :lines, :itinerary_link, :string
  end
end
