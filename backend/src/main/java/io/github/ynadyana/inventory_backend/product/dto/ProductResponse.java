package io.github.ynadyana.inventory_backend.product.dto;

import java.math.BigDecimal;

// Add 'Integer stock' to the record
public record ProductResponse(
    Long id,
    String sku,
    String name,
    String description,
    String category,
    BigDecimal price,
    boolean active,
    String imageUrl,
    Integer stock // <--- NEW FIELD
) {}