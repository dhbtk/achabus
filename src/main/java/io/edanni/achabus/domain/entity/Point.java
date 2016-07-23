package io.edanni.achabus.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

/**
 * Entidade para uma parada de ônibus ou um waypoint de roteamento.
 */
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "points")
public @Data class Point extends AbstractEntity
{
    @Type(type = "jts_geometry")
    private com.vividsolutions.jts.geom.Point position;
    private String name;
    private String notable_name;
    private Boolean notable;
    private Boolean waypoint;
    private BigDecimal heading;
}
