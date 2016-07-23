package io.edanni.achabus.domain.repository;

import io.edanni.achabus.domain.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Created by eduardo on 23/07/16.
 */
@Repository
public interface RouteRepository extends JpaRepository<Route, Integer>
{
}
