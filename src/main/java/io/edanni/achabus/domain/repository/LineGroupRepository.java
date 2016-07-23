package io.edanni.achabus.domain.repository;

import io.edanni.achabus.domain.entity.LineGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

/**
 * Created by eduardo on 23/07/16.
 */
@Repository
@RestResource(path = "/line_groups")
public interface LineGroupRepository extends JpaRepository<LineGroup, Integer>
{
}
