package io.edanni.achabus.domain.entity.routing;

import com.vividsolutions.jts.geom.Point;
import lombok.Data;
import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.math.BigDecimal;

/**
 * Entidade representando um vértice do mapa do OSM.
 */
@Entity
@Table(schema = "routing", name = "ways_vertices_pgr")
public @Data class WayVertex
{
    @Id
    private Long id;
    private Long osmId;
    private Integer cnt;
    private Integer chk;
    private Integer ein;
    private Integer eout;
    private BigDecimal lon;
    private BigDecimal lat;
    @Type(type = "jts_geometry")
    private Point theGeom;
}
