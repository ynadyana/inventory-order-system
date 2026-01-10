package io.github.ynadyana.inventory_backend.inventory;

import io.github.ynadyana.inventory_backend.product.model.Product;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public Inventory getInventory(String sku) {
        return inventoryRepository.findByProduct_Sku(sku)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory not found for SKU: " + sku));
    }

    // vvvvv CHANGED "void" TO "Inventory" vvvvv
    @Transactional
    public Inventory updateStock(String sku, int quantityChange) {
        Inventory inventory = getInventory(sku);
        int newQuantity = inventory.getQuantity() + quantityChange;
        
        if (newQuantity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock");
        }
        
        inventory.setQuantity(newQuantity);
        inventory.setLastUpdated(Instant.now());
        
        // vvvvv ADDED "return" HERE vvvvv
        return inventoryRepository.save(inventory);
    }

    public void createInventory(Product product) {
        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(0)
                .lastUpdated(Instant.now())
                .build();
        inventoryRepository.save(inventory);
    }
}