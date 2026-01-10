// src/main/java/io/github/ynadyana/inventory_backend/product/dto/ProductRequest.java

package io.github.ynadyana.inventory_backend.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductRequest(
    @NotBlank(message = "SKU is required")
    String sku,

    @NotBlank(message = "Name is required")
    String name,

    String description,

    @NotBlank(message = "Category is required")
    String category,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    BigDecimal price
) {}