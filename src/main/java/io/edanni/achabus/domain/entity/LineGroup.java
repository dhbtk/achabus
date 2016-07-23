package io.edanni.achabus.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * Grupo de linhas de ônibus.
 */
@Entity
@Table(name = "line_groups")
public class LineGroup extends AbstractEntity
{
    @NotNull
    private String name;
    @NotNull
    private String city;

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getCity()
    {
        return city;
    }

    public void setCity(String city)
    {
        this.city = city;
    }
}
