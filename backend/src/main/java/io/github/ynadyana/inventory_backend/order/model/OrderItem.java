package io.github.ynadyana.inventory_backend.order.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor; 
import lombok.Builder;           
import lombok.Data;
import lombok.NoArgsConstructor; 
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@Builder            
@NoArgsConstructor  
@AllArgsConstructor 
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    private Long productId;
    private Integer quantity;
    private BigDecimal price;
}