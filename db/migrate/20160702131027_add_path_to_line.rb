class AddPathToLine < ActiveRecord::Migration[5.0]
  def up
    add_column :lines, :path, :string, array: true, default: []
    Line.all.each do |line|
      path = line.routes.pluck(:origin, :destination).flatten.uniq
      if path.include? 'Terminal'
        if path.count == 3 && path.index('Terminal') != 1
          path.slice!(path.index('Terminal'))
          path.insert(1, 'Terminal')
        elsif path.count == 2 && path.index('Terminal') != 0
          path.reverse!
        end
        line.update(path: path)
      end
    end

    rename_column :lines, :short_name, :identifier

    rename_column :routes, :short_name, :observation
    remove_column :routes, :name
    remove_column :routes, :route_path_markers
    remove_foreign_key :routes, column: :parent_route_id
    remove_column :routes, :parent_route_id

    remove_foreign_key :timetables, column: :start_place_id
    remove_foreign_key :timetables, column: :end_place_id
    remove_column :timetables, :start_place_id
    remove_column :timetables, :end_place_id
    add_column :timetables, :time, :time, null: false
  end
end
