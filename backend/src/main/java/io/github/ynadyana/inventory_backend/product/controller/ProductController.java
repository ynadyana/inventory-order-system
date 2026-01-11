package io.github.ynadyana.inventory_backend.product.controller;

import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.dto.ProductResponse;
import io.github.ynadyana.inventory_backend.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // --- FIX: UPDATED TO ACCEPT FILE + DATA (MULTIPART) ---
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('STAFF')") // Ensure user is STAFF
    public ProductResponse createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        // We pass the raw fields to the service
        return productService.createProductWithImage(name, description, price, stock, category, image);
    }

    // GET /api/products (CUSTOMER & STAFF)
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF')")
    public Page<ProductResponse> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
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

    // Upload Image Endpoint (Optional Utility)
    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('STAFF')")
    public ProductResponse uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        return productService.uploadImage(id, file);
    }
}