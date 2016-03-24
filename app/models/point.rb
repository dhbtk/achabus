class Point < ApplicationRecord
	has_many :place_points
	has_many :places, through: :place_points

	DELTA = 0.00005 # Aprox. 5 metros de latitude

	def rad_heading(dir = heading)
		(dir * Math::PI)/180
	end

	def move_forward
		move_in_direction
	end

	def move_backward
		move_in_direction(rad_heading + Math::PI)
	end

	def move_left
		move_in_direction(rad_heading - Math::PI/2)
	end

	def move_right
		move_in_direction(rad_heading + Math::PI/2)
	end

	def move_in_direction(rad = rad_heading)
		lon = self.position.lon + Math::sin(rad)*DELTA;
		lat = self.position.lat + Math::cos(rad)*DELTA;

		update(position: "POINT (#{lon} #{lat})")
	end
end
