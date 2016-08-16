class LineGroup < ApplicationRecord
  has_many :lines, -> { order('identifier ASC') }, dependent: :restrict_with_error
  validates :name, :city, presence: true
end
