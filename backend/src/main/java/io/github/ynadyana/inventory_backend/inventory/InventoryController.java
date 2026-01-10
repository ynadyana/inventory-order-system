package io.github.ynadyana.inventory_backend.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // GET /api/inventory/{sku} (Accessible by Customer & Staff)
    @GetMapping("/{sku}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF')")
    public Map<String, Object> getStock(@PathVariable String sku) {
        Inventory inv = inventoryService.getInventory(sku);
        return Map.of(
            "sku", inv.getProduct().getSku(),
            "quantity", inv.getQuantity(),
            "lastUpdated", inv.getLastUpdated()
        );
    }

    // POST /api/inventory/{sku}/add (Staff Only)
    // Body: { "quantity": 10 } (Can be negative to reduce stock)
    @PostMapping("/{sku}/add")
    @PreAuthorize("hasRole('STAFF')")
    public Map<String, Object> addStock(@PathVariable String sku, @RequestBody Map<String, Integer> body) {
        int quantityToAdd = body.get("quantity");
        Inventory inv = inventoryService.updateStock(sku, quantityToAdd);
        return Map.of(
            "sku", inv.getProduct().getSku(),
            "newQuantity", inv.getQuantity()
        );
    }
}