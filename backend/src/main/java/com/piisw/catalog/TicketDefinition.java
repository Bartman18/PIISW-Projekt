package com.piisw.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "ticket_definitions")
public class TicketDefinition {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String category;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "validity_days")
    private Integer validityDays;

    protected TicketDefinition() {
    }

    public TicketDefinition(String id, String name, BigDecimal price, String type, String category,
                            Integer durationMinutes, Integer validityDays) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.type = type;
        this.category = category;
        this.durationMinutes = durationMinutes;
        this.validityDays = validityDays;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getType() {
        return type;
    }

    public String getCategory() {
        return category;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public Integer getValidityDays() {
        return validityDays;
    }
}
