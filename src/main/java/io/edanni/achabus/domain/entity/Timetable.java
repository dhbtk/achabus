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
public class Timetable extends AbstractEntity
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

    public Route getRoute()
    {
        return route;
    }

    public void setRoute(Route route)
    {
        this.route = route;
    }

    public LocalTime getTime()
    {
        return time;
    }

    public void setTime(LocalTime time)
    {
        this.time = time;
    }

    public Boolean getSunday()
    {
        return sunday;
    }

    public void setSunday(Boolean sunday)
    {
        this.sunday = sunday;
    }

    public Boolean getMonday()
    {
        return monday;
    }

    public void setMonday(Boolean monday)
    {
        this.monday = monday;
    }

    public Boolean getTuesday()
    {
        return tuesday;
    }

    public void setTuesday(Boolean tuesday)
    {
        this.tuesday = tuesday;
    }

    public Boolean getWednesday()
    {
        return wednesday;
    }

    public void setWednesday(Boolean wednesday)
    {
        this.wednesday = wednesday;
    }

    public Boolean getThursday()
    {
        return thursday;
    }

    public void setThursday(Boolean thursday)
    {
        this.thursday = thursday;
    }

    public Boolean getFriday()
    {
        return friday;
    }

    public void setFriday(Boolean friday)
    {
        this.friday = friday;
    }

    public Boolean getSaturday()
    {
        return saturday;
    }

    public void setSaturday(Boolean saturday)
    {
        this.saturday = saturday;
    }
}
