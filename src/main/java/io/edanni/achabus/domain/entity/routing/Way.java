package io.edanni.achabus.domain.entity.routing;

import com.vividsolutions.jts.geom.LineString;
import io.edanni.achabus.domain.entity.AbstractEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

/**
 * Entidade representando um segmento de rua do OSM.
 */
@Entity
@Table(schema = "routing", name = "ways")
public @Data class Way
{
    @Id
    private Long gid;
    @NotNull
    private Integer classId;
    private Double length;
    @Column(name = "length_m")
    private Double lengthM;
    private String name;
    @ManyToOne
    @JoinColumn(name = "source")
    private WayVertex source;
    @ManyToOne
    @JoinColumn(name = "target")
    private WayVertex target;
    private Double x1;
    private Double y1;
    private Double x2;
    private Double y2;
    private Double cost;
    private Double reverseCost;
    @Column(name = "cost_s")
    private Double costS;
    @Column(name = "reverse_cost_s")
    private Double reverseCostS;
    private String rule;
    private Integer oneWay;
    private Integer maxspeedForward;
    private Integer maxspeedBackward;
    private Long osmId;
    private Long sourceOsm;
    private Long targetOsm;
    private Double priority;
    @Type(type = "jts_geometry")
    private LineString theGeom;
}
