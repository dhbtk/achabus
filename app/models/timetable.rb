class Timetable < ApplicationRecord
  belongs_to :route

  validates :time, :route, presence: true

  def self.by_line(line)
    {
        mon_fri: where(sunday: false, monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false),
        saturday: where(sunday: false, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: true),
        sunday: where(sunday: true, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false)
    }.map do |key, cond|
      origin_dests = line.path_combinations
      entries = []
      origin_dests.each do |origin, destination|
        route_ids = line.routes.where(origin: origin, destination: destination).pluck(:id)
        entries << ["#{origin}, #{destination}", cond.where('route_id IN (?)', route_ids).order(
            "CASE date_part('hour', \"time\") WHEN 0 THEN 24 ELSE date_part('hour', \"time\") END, date_part('minute', \"time\")")] unless route_ids.empty?
      end
      [key, entries.to_h]
    end.to_h
  end
end
