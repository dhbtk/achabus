class CreatePoints < ActiveRecord::Migration[5.0]
  def change
    create_table :points do |t|
      t.st_point :position, geographic: true
      t.st_point :heading
      t.string :name
      t.string :notable_name
      t.boolean :notable

      t.timestamps
    end
  end
end
