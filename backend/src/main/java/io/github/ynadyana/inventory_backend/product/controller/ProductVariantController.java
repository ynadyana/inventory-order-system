package io.github.ynadyana.inventory_backend.product.controller;

import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.model.ProductVariant;
import io.github.ynadyana.inventory_backend.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ProductVariantController {

    private final ProductService productService;

    // POST: Add Variant with Images
    @PostMapping(value = "/products/{productId}/variants", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductVariant> addVariant(
            @PathVariable Long productId,
            @RequestPart("data") ProductRequest.VariantDto request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "albumImages", required = false) List<MultipartFile> albumImages) {
        
        return ResponseEntity.ok(productService.addVariant(productId, request, image, albumImages));
    }

    // PUT: Update Variant with Images accepts MultipartFile
    @PutMapping(value = "/variants/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductVariant> updateVariant(
            @PathVariable Long id,
            @RequestPart("data") ProductRequest.VariantDto request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "albumImages", required = false) List<MultipartFile> albumImages) {
        
        return ResponseEntity.ok(productService.updateVariant(id, request, image, albumImages));
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