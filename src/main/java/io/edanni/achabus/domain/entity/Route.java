package io.edanni.achabus.domain.entity;

import com.vividsolutions.jts.geom.LineString;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * Entidade representando uma rota de uma linha.
 */
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "routes")
public class Route extends AbstractEntity
{
    private String observation;
    @ManyToOne
    @NotNull
    private Line line;
    @Type(type = "jts_geometry")
    private LineString route;
    @NotNull
    private String origin;
    @NotNull
    private String destination;

    public String getObservation()
    {
        return observation;
    }

    public void setObservation(String observation)
    {
        this.observation = observation;
    }

    public Line getLine()
    {
        return line;
    }

    public void setLine(Line line)
    {
        this.line = line;
    }

    public LineString getRoute()
    {
        return route;
    }

    public void setRoute(LineString route)
    {
        this.route = route;
    }

    public String getOrigin()
    {
        return origin;
    }

    public void setOrigin(String origin)
    {
        this.origin = origin;
    }

    public String getDestination()
    {
        return destination;
    }

    public void setDestination(String destination)
    {
        this.destination = destination;
    }
}
