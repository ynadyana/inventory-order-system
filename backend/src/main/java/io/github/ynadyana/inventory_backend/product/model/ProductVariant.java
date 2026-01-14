package io.github.ynadyana.inventory_backend.product.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data; // <--- This provides getStock()
import lombok.NoArgsConstructor;
import java.util.ArrayList; 
import java.util.List;

@Entity
@Data // <--- ENSURE THIS IS HERE
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "color_name") 
    private String colorName; 

    @Column(name = "color_value")
    private String colorHex;

    private String imageUrl; 

    @ElementCollection
    @CollectionTable(name = "variant_images", joinColumns = @JoinColumn(name = "variant_id"))
    @Column(name = "image_url")
    private List<String> albumImages = new ArrayList<>();
  
    private Integer stock; // <--- THIS FIELD MUST EXIST

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonBackReference 
    private Product product;
}