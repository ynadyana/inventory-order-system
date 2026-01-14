package io.github.ynadyana.inventory_backend.product.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;
    
    private String category;

    private String imageUrl;

    @Column(nullable = false)
    private BigDecimal price;

    private boolean active;

    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProductVariant> variants = new ArrayList<>();

    // Calculated Getter for total stock
    @Transient 
    public Integer getTotalStock() {
        if (variants == null || variants.isEmpty()) {
            return 0; 
        }
        return variants.stream().mapToInt(v -> v.getStock() == null ? 0 : v.getStock()).sum();
    }

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}