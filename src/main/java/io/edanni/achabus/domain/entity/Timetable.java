package io.edanni.achabus.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.time.LocalTime;

/**
 * Created by eduardo on 23/07/16.
 */
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "timetables")
public @Data class Timetable extends AbstractEntity
{
    @ManyToOne
    @NotNull
    private Route route;
    @NotNull
    private LocalTime time;
    private Boolean sunday;
    private Boolean monday;
    private Boolean tuesday;
    private Boolean wednesday;
    private Boolean thursday;
    private Boolean friday;
    private Boolean saturday;
}
