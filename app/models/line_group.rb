class LineGroup < ApplicationRecord
	has_many :lines, -> { order('short_name ASC') }, dependent: :restrict_with_error
end
