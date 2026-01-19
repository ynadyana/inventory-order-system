package io.github.ynadyana.inventory_backend.order.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.github.ynadyana.inventory_backend.product.model.Product;
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

    @Column(name = "product_id")
    private Long productId;

    private String variantName;

    @ManyToOne(fetch = FetchType.LAZY)  
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    @JsonIgnore  // Prevents Hibernate proxy serialization error
    private Product product; 

    private Integer quantity;
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "order_id")
    @JsonBackReference  
    private Order order;
}