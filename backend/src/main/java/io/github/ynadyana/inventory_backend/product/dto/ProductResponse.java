package io.github.ynadyana.inventory_backend.product.dto;

import java.math.BigDecimal;
import java.util.List;


public record ProductResponse(
    Long id,
    String sku,
    String name,
    String description,
    String category,
    BigDecimal price,
    boolean active,
    String imageUrl,
    Integer stock, 
    List<VariantDto> variants
) {
    public record VariantDto(
        String colorName,
        String colorHex,
        String imageUrl,
        Integer stock
    ) {}

}