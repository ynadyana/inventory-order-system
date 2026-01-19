package io.github.ynadyana.inventory_backend.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private List<OrderItemRequest> items;
    private BigDecimal totalAmount;
    private String shippingMethod;
    private String shippingAddress;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
        private String variantName;  // ← CRITICAL: This must be here!
    }
}