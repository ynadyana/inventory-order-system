package io.github.ynadyana.inventory_backend.product.repository;

import io.github.ynadyana.inventory_backend.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySku(String sku);

    Optional<Product> findBySku(String sku);

  
    // 1. For Customers: Search by name AND ensure product is active
    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name, Pageable pageable);

    // 2. For Staff: Search by name (Active OR Inactive)
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // 3. For Customers: Filter by Category AND Active
    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    // 4. For Staff: Filter by Category (All)
    Page<Product> findByCategory(String category, Pageable pageable);

    // 5. For Customers: Just get list (Active only)
    Page<Product> findByActiveTrue(Pageable pageable);
}