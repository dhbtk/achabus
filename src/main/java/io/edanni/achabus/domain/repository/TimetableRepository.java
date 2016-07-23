package io.edanni.achabus.domain.repository;

import io.edanni.achabus.domain.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Created by eduardo on 23/07/16.
 */
@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Integer>
{
}
