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

   
    @Column(name = "product_id")
    private Long productId;

 
    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product; 

    private Integer quantity;
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore 
    private Order order;
}