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
public @Data class Route extends AbstractEntity
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
}
