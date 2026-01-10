package io.github.ynadyana.inventory_backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    // Find inventory by the Product's ID (not the inventory ID)
    Optional<Inventory> findByProductId(Long productId);
    
    // Find by SKU (useful for API lookups)
    Optional<Inventory> findByProduct_Sku(String sku);
}