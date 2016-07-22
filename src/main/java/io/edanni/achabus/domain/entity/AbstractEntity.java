package io.edanni.achabus.domain.entity;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Nossa entidade mãe de todas
 */
@MappedSuperclass
public abstract @Data class AbstractEntity implements Serializable
{
    @Id
    @Column(columnDefinition = "serial")
    private Integer id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate()
    {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate()
    {
        updatedAt = LocalDateTime.now();
    }
}
