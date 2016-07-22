package io.edanni.achabus.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * Entidade que agrupa todas as rotas que pertencem a uma linha.
 */
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "lines")
public @Data class Line extends AbstractEntity
{
    private String identifier;

    @NotNull
    private String name;

    @ManyToOne
    @NotNull
    private LineGroup lineGroup;
}
