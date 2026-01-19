package io.github.ynadyana.inventory_backend.order.dto;

import io.github.ynadyana.inventory_backend.order.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;        // Return ID instead of full User object
    private String userEmail; 
    private String username;  
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private String shippingMethod;
    private String shippingAddress;
    private OrderStatus status;
    private List<OrderItemResponse> items;

    @Data
    @Builder
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private String variantName;
        private int quantity;
        private BigDecimal price;
    }
}