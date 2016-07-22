package io.edanni.achabus.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * Grupo de linhas de ônibus.
 */
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "line_groups")
public @Data class LineGroup extends AbstractEntity
{
    @NotNull
    private String name;
    @NotNull
    private String city;
}
