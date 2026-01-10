package io.github.ynadyana.inventory_backend.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record OrderItemRequest(
    @NotBlank String sku,
    @Min(1) Integer quantity
) {}