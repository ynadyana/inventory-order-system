// src/main/java/io/github/ynadyana/inventory_backend/product/controller/ProductController.java

package io.github.ynadyana.inventory_backend.product.controller;

import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.dto.ProductResponse;
import io.github.ynadyana.inventory_backend.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // POST /api/products (STAFF ONLY)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('STAFF')")
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }

    // GET /api/products (CUSTOMER & STAFF)
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF')")
    public Page<ProductResponse> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category, // <--- New Param
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        boolean isStaff = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));

        return productService.getAllProducts(search, category, isStaff, pageable);
    }
    // GET /api/products/{id} (CUSTOMER & STAFF)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF')")
    public ProductResponse getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // PUT /api/products/{id} (STAFF ONLY)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    // DELETE /api/products/{id} (STAFF ONLY - Soft Delete)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('STAFF')")
    public void deleteProduct(@PathVariable Long id) {
        productService.deactivateProduct(id);
    }

    // NEW ENDPOINT: Upload Image
    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('STAFF')") // Only staff can upload
    public ProductResponse uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        return productService.uploadImage(id, file);
    }
}