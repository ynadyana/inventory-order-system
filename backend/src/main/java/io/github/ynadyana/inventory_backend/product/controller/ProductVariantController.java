package io.github.ynadyana.inventory_backend.product.controller;

import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.model.ProductVariant;
import io.github.ynadyana.inventory_backend.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductVariantController {

    private final ProductService productService;

    // Accepts MultipartFile and passes it to service
    @PostMapping(value = "/products/{productId}/variants", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductVariant> addVariant(
            @PathVariable Long productId,
            @RequestPart("data") ProductRequest.VariantDto request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        
        // Fixed the "formal argument lists differ" error
        return ResponseEntity.ok(productService.addVariant(productId, request, image));
    }

    @PutMapping("/variants/{id}")
    public ResponseEntity<ProductVariant> updateVariant(
            @PathVariable Long id,
            @RequestBody ProductRequest.VariantDto request) {
        return ResponseEntity.ok(productService.updateVariant(id, request));
    }

    @PutMapping("/variants/{id}/stock")
    public ResponseEntity<ProductVariant> updateStock(
            @PathVariable Long id,
            @RequestParam Integer newStock) {
        return ResponseEntity.ok(productService.updateVariantStock(id, newStock));
    }

    @DeleteMapping("/variants/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long id) {
        productService.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }
}