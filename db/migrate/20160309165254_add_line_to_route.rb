class AddLineToRoute < ActiveRecord::Migration[5.0]
  def change
    add_reference :routes, :line, foreign_key: true
  end
end
