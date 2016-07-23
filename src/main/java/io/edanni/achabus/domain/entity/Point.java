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
public class Point extends AbstractEntity
{
    @Type(type = "jts_geometry")
    private com.vividsolutions.jts.geom.Point position;
    private String name;
    private String notable_name;
    private Boolean notable;
    private Boolean waypoint;
    private BigDecimal heading;

    public com.vividsolutions.jts.geom.Point getPosition()
    {
        return position;
    }

    public void setPosition(com.vividsolutions.jts.geom.Point position)
    {
        this.position = position;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getNotable_name()
    {
        return notable_name;
    }

    public void setNotable_name(String notable_name)
    {
        this.notable_name = notable_name;
    }

    public Boolean getNotable()
    {
        return notable;
    }

    public void setNotable(Boolean notable)
    {
        this.notable = notable;
    }

    public Boolean getWaypoint()
    {
        return waypoint;
    }

    public void setWaypoint(Boolean waypoint)
    {
        this.waypoint = waypoint;
    }

    public BigDecimal getHeading()
    {
        return heading;
    }

    public void setHeading(BigDecimal heading)
    {
        this.heading = heading;
    }
}
