class ClosestStreetSegment
  attr_reader :gid, :point, :source, :target, :path_index, :closest_point_distance, :source_distance, :target_distance, :source_line, :target_line, :closest_point_line

  def self.from_point_and_gid(point, gid)
    a = ClosestStreetSegment.new
    a.instance_eval do
      @point = point
      @gid = gid
    end
    a
  end

  def self.from_point(point)
    a = ClosestStreetSegment.new
    a.instance_eval do
      @point = point
      calculate_gid
    end
    a
  end

  def calculate_gid
    point_text = @point.to_s
    sql = "SELECT gid
FROM routing.ways
WHERE st_dwithin(the_geom :: GEOGRAPHY, st_geographyfromtext('#{point_text}'), 50)
ORDER BY ST_distance(the_geom :: GEOGRAPHY, st_geographyfromtext('#{point_text}'))
LIMIT 1"
    @gid = ApplicationRecord.connection.execute(sql).values[0][0]
  end

  def get_points
    if @source && @target
      [@source, @target]
    else
      sql = "
    SELECT
  source,
  target,
  (foo.dp).path [1] AS idx,
  st_distance(st_geographyfromtext('#{@point}'), st_closestpoint(st_geographyfromtext('#{@point}')::geometry, w.the_geom) :: GEOGRAPHY) AS dist_cp,
  st_distance(st_closestpoint(st_geographyfromtext('#{@point}')::geometry, w.the_geom) :: GEOGRAPHY, (foo.dp).geom :: GEOGRAPHY) AS dist_rp,
  (SELECT st_length(st_makeline(array_agg((a).geom)) :: GEOGRAPHY)
   FROM (
          SELECT st_dumppoints(the_geom) AS a
          FROM routing.ways wa
          WHERE wa.gid = w.gid
          LIMIT (foo.dp).path [1]
        ) f)                                                                                                AS dist_source,
  (SELECT st_length(st_makeline(array_agg((a).geom)) :: GEOGRAPHY)
   FROM (
          SELECT st_dumppoints(the_geom) AS a
          FROM routing.ways wa
          WHERE wa.gid = w.gid
          OFFSET (foo.dp).path [1] - 1
        ) f)                                                                                                AS dist_target,
(SELECT st_astext(st_makeline(array_agg((a).geom)) :: GEOGRAPHY)
   FROM (
          SELECT st_dumppoints(the_geom) AS a
          FROM routing.ways wa
          WHERE wa.gid = w.gid
          LIMIT (foo.dp).path [1]
        ) f)                                                                                                AS source_line,
  (SELECT st_astext(st_makeline(array_agg((a).geom)) :: GEOGRAPHY)
   FROM (
          SELECT st_dumppoints(the_geom) AS a
          FROM routing.ways wa
          WHERE wa.gid = w.gid
          OFFSET (foo.dp).path [1] - 1
        ) f)                                                                                                AS target_line,
  st_astext(st_makeline(st_closestpoint(st_geographyfromtext('#{@point}')::geometry, w.the_geom), st_geographyfromtext('#{@point}')::geometry)::geography) as closest_point_line
FROM (
       SELECT st_dumppoints(w.the_geom) AS dp
       FROM routing.ways w
       WHERE w.gid = #{@gid}
     ) foo, routing.ways w
WHERE w.gid = #{@gid}
ORDER BY dist_rp
LIMIT 1
"
      res = ApplicationRecord.connection.execute(sql).values[0]
      @source = res[0] # source
      @target = res[1] # target
      @path_index = res[2] # idx
      @closest_point_distance = res[3] # dist_cp
      @source_distance = res[5]
      @target_distance = res[6]
      @source_line = res[7]
      @target_line = res[8]
      @closest_point_line = res[9]

      [res[0], res[1]]
    end
  end
end