class Line < ApplicationRecord
  belongs_to :line_group
  has_many :routes, -> { order("origin ASC, coalesce(observation, '') ASC") }
  has_many :timetables, through: :routes

  validates :line_group, :name, :timetable_link, presence: true

  default_scope { order('identifier ASC') }

  def self.filter(str)
    str = "%#{str}%"
    joins(:line_group).where('identifier ilike ? OR lines.name ilike ? OR line_groups.name ilike ? OR line_groups.city ilike ?', str, str, str, str)
  end

  # Retorna as combinações dos itens da rota da linha, para montar a tabela de horários.
  #
  # @return [Array] as combinações
  def path_combinations
    origin_dests = []
    0.upto(path.length - 2) do |i|
      origin_dests << [path[i], path[i + 1]]
    end
    origin_dests += origin_dests.reverse.map{|i| i.reverse}

    (origin_dests + routes.map{|r| [r.origin, r.destination]}).uniq
  end
end
