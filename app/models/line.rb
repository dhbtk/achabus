class Line < ApplicationRecord
  belongs_to :line_group
  has_many :routes

  default_scope { order('short_name ASC') }

  def self.filter(str)
    str = "%#{str}%"
    joins(:line_group).where('short_name ilike ? OR lines.name ilike ? OR line_groups.name ilike ? OR line_groups.city ilike ?', str, str, str, str)
  end
end
