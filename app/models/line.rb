class Line < ApplicationRecord
  belongs_to :line_group
  has_many :routes
  has_many :timetables, through: :routes

  validates :line_group, :name, :timetable_link, presence: true

  default_scope { order('identifier ASC') }

  def self.filter(str)
    str = "%#{str}%"
    joins(:line_group).where('identifier ilike ? OR lines.name ilike ? OR line_groups.name ilike ? OR line_groups.city ilike ?', str, str, str, str)
  end
end
