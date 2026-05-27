package com.piisw.ticket;

import com.piisw.catalog.TicketDefinition;
import com.piisw.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne
    @JoinColumn(name = "definition_id", nullable = false)
    private TicketDefinition definition;

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

    @Column(nullable = false)
    private String status;

    @Column(name = "purchase_time", nullable = false)
    private Instant purchaseTime;

    @Column(name = "validation_time")
    private Instant validationTime;

    @Column(name = "vehicle_id")
    private String vehicleId;

    @Column(name = "valid_until")
    private Instant validUntil;

    protected Ticket() {
    }

    public Ticket(String id, User owner, TicketDefinition definition, String status, Instant purchaseTime) {
        this.id = id;
        this.owner = owner;
        this.definition = definition;
        this.name = definition.getName();
        this.price = definition.getPrice();
        this.type = definition.getType();
        this.category = definition.getCategory();
        this.durationMinutes = definition.getDurationMinutes();
        this.validityDays = definition.getValidityDays();
        this.status = status;
        this.purchaseTime = purchaseTime;
    }

    public String getId() {
        return id;
    }

    public User getOwner() {
        return owner;
    }

    public TicketDefinition getDefinition() {
        return definition;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getPurchaseTime() {
        return purchaseTime;
    }

    public Instant getValidationTime() {
        return validationTime;
    }

    public void setValidationTime(Instant validationTime) {
        this.validationTime = validationTime;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Instant getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(Instant validUntil) {
        this.validUntil = validUntil;
    }
}
