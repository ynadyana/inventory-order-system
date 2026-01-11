package io.github.ynadyana.inventory_backend.inventory;

import io.github.ynadyana.inventory_backend.product.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    // 1. Create Inventory (Used by ProductService)
    public void createInventory(Product product, Integer initialStock) {
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantity(initialStock != null ? initialStock : 0);
        inventoryRepository.save(inventory);
    }

    // 2. Check Stock (Used by OrderService)
    public boolean checkStock(Long productId, Integer quantity) {
        Optional<Inventory> inventory = inventoryRepository.findByProductId(productId);
        return inventory.isPresent() && inventory.get().getQuantity() >= quantity;
    }

    // 3. Reduce Stock (Used by OrderService)
    public void reduceStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not in inventory"));
        
        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);
    }

    // 4. Get Inventory by SKU (Fixes Controller Error)
    public Inventory getInventory(String sku) {
        return inventoryRepository.findByProductSku(sku)
                .orElseThrow(() -> new RuntimeException("Inventory not found for SKU: " + sku));
    }

    // 5. Update Stock by SKU (Fixes Controller Error)
    // --- CHANGED FROM void TO Inventory ---
    public Inventory updateStock(String sku, int quantity) {
        Inventory inventory = getInventory(sku);
        inventory.setQuantity(quantity);
        return inventoryRepository.save(inventory); // Returns the updated object now!
    }
}