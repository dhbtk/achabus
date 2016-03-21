class Line < ApplicationRecord
  belongs_to :line_group
  has_many :routes

  default_scope { order('short_name ASC') }
end
