class AddEndPointsToRoute < ActiveRecord::Migration[5.0]
  def change
    add_column :routes, :origin, :string
    add_column :routes, :destination, :string

    Route.all.each do |route|
      origin, destination = route.name.split(' - ')
      route.update(origin: origin, destination: destination)
    end
  end
end
