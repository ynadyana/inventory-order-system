package io.github.ynadyana.inventory_backend.product.dto;
import io.github.ynadyana.inventory_backend.product.model.ProductColor; 
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
    List<ProductColor> colors
) {}