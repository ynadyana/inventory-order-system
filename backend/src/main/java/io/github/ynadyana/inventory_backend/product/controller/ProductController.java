package io.github.ynadyana.inventory_backend.product.controller;

import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.model.Product;
import io.github.ynadyana.inventory_backend.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 1. Create Product (JSON only)
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    // 2. Create Product with Image (Multipart)
    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProductWithImage(
            @RequestParam("sku") String sku,
            @RequestParam("name") String name,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam("category") String category,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return ResponseEntity.ok(productService.createProductWithImage(sku, name, price, stock, category, image));
    }

    // 3. Get All (Search/Filter)
    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly,
            Pageable pageable
    ) {
        return ResponseEntity.ok(productService.getAllProducts(search, category, activeOnly, pageable));
    }

    // 4. Get By ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // 5. Update
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    // 6. Deactivate
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateProduct(@PathVariable Long id) {
        productService.deactivateProduct(id);
        return ResponseEntity.noContent().build();
    }

    // 7. Upload Image
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(productService.uploadImage(id, file));
    }
}