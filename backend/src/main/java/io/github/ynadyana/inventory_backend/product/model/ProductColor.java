package io.github.ynadyana.inventory_backend.product.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductColor {
    
    @Column(name = "color_value")
    private String colorHex;
    private String imageUrl; 
}