class Line < ApplicationRecord
  belongs_to :line_group
  has_many :routes
end
