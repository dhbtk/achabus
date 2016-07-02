class Timetable < ApplicationRecord
  belongs_to :route

  def self.by_line(line)
    {
        mon_fri: where(sunday: false, monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false),
        saturday: where(sunday: false, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: true),
        sunday: where(sunday: true, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false)
    }.map do |key, cond|
      path = line.path
      puts path.join(', ')
      origin_dests = []
      0.upto(path.length - 2) do |i|
        origin_dests << [path[i], path[i + 1]]
      end
      origin_dests += origin_dests.reverse.map{|i| i.reverse}
      entries = []
      origin_dests.each do |origin, destination|
        route_ids = line.routes.where(origin: origin, destination: destination).pluck(:id)
        entries << ["#{origin}, #{destination}", cond.where('route_id IN (?)', route_ids)]
      end
      [key, entries.to_h]
    end.to_h
  end
end
