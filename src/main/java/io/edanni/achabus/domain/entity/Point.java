package io.edanni.achabus.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

/**
 * Created by eduardo on 22/07/16.
 */
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "points")
public @Data class Point extends AbstractEntity
{
    @Type(type = "org.hibernate.spatial.GeometryType")
    private org.geolatte.geom.Point position;
    private String name;
    private String notable_name;
    private Boolean notable;
    private Boolean waypoint;
    private BigDecimal heading;
}
