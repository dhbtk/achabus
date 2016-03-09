class Point < ApplicationRecord
	has_many :place_points
	has_many :places, through: :place_points
end
