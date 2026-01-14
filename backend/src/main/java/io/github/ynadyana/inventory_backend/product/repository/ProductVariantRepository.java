package io.github.ynadyana.inventory_backend.product.repository;

import io.github.ynadyana.inventory_backend.product.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findByProductIdAndColorName(Long productId, String colorName);
}