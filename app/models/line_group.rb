class LineGroup < ApplicationRecord
	has_many :lines, dependent: :restrict_with_error
end
