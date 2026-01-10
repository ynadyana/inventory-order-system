package io.github.ynadyana.inventory_backend.product.dto;

import java.math.BigDecimal;

public record ProductResponse(
    Long id,
    String sku,
    String name,
    String description,
    String category, // <--- Ensure this is here, BEFORE price
    BigDecimal price,
    boolean active,
    String imageUrl
) {}