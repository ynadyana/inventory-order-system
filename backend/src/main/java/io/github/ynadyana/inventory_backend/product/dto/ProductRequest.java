package io.github.ynadyana.inventory_backend.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {

    private String sku;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    
    private Integer stock; 
    private String brand;

    private String imageUrl;

    private List<VariantDto> variants;

    @Data
    public static class VariantDto {
        private String colorName;
        private String colorHex;
        private Integer stock;
        private String imageUrl;
        private String storage;
        private BigDecimal price;
        private String sku;
        private String brand;
    }
}