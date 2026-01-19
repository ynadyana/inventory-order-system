package io.github.ynadyana.inventory_backend.order.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import io.github.ynadyana.inventory_backend.user.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)  
    @JoinColumn(name = "user_id")
    private AppUser user;

    private BigDecimal totalAmount;
    private LocalDateTime orderDate;

    private String shippingMethod; 
    private String shippingAddress;

    @Enumerated(EnumType.STRING) 
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true) 
    @JsonManagedReference
    @Builder.Default  // Prevents null list in builder
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (orderDate == null) orderDate = LocalDateTime.now();
    }
}