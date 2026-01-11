package io.github.ynadyana.inventory_backend.order.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.github.ynadyana.inventory_backend.product.model.Product; // Import Product
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // We keep this for easy reference
    @Column(name = "product_id")
    private Long productId;

    // --- FIX: ADD THIS RELATIONSHIP ---
    // This tells JPA: "Use the product_id column to fetch the full Product details"
    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product; 

    private Integer quantity;
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore // Prevent infinite loops
    private Order order;
}