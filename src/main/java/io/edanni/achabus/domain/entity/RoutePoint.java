package io.edanni.achabus.domain.entity;

import io.edanni.achabus.domain.entity.routing.Way;
import io.edanni.achabus.domain.entity.routing.WayVertex;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * Entidade associativa entre uma rota e um ponto.
 */
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "route_points")
public
class RoutePoint extends AbstractEntity
{
    @NotNull
    @ManyToOne
    private Route route;
    @NotNull
    @ManyToOne
    private Point point;
    private Integer order;
    private Integer polylineIndex;
    @ManyToOne
    @JoinColumn(name = "closest_way")
    private Way closestWay;

    public Route getRoute()
    {
        return route;
    }

    public void setRoute(Route route)
    {
        this.route = route;
    }

    public Point getPoint()
    {
        return point;
    }

    public void setPoint(Point point)
    {
        this.point = point;
    }

    public Integer getOrder()
    {
        return order;
    }

    public void setOrder(Integer order)
    {
        this.order = order;
    }

    public Integer getPolylineIndex()
    {
        return polylineIndex;
    }

    public void setPolylineIndex(Integer polylineIndex)
    {
        this.polylineIndex = polylineIndex;
    }

    public Way getClosestWay()
    {
        return closestWay;
    }

    public void setClosestWay(Way closestWay)
    {
        this.closestWay = closestWay;
    }
}
