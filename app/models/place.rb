class Place < ApplicationRecord
	has_many :place_points
	has_many :points, through: :place_points
end
