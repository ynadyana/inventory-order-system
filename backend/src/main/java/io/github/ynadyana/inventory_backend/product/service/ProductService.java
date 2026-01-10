package io.github.ynadyana.inventory_backend.product.service;

import io.github.ynadyana.inventory_backend.inventory.InventoryService;
import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.dto.ProductResponse;
import io.github.ynadyana.inventory_backend.product.model.Product;
import io.github.ynadyana.inventory_backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // <--- 1. Logging Import
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j // <--- 2. Enables Logging
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    // Define the upload path
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    // --- 1. CREATE ---
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
        }

        Product product = Product.builder()
                .sku(request.sku())
                .name(request.name())
                .description(request.description())
                .category(request.category())
                .price(request.price())
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);
        inventoryService.createInventory(savedProduct);

        log.info("Product created: {} (ID: {})", savedProduct.getName(), savedProduct.getId()); // <--- Logging

        return toProductResponse(savedProduct);
    }

    // --- NEW: UPLOAD IMAGE ---
    public ProductResponse uploadImage(Long id, MultipartFile file) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        try {
            // 1. Create the uploads folder if it doesn't exist
            Files.createDirectories(fileStorageLocation);

            // 2. Generate a unique filename (to avoid "image.jpg" overwriting "image.jpg")
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = fileStorageLocation.resolve(fileName);

            // 3. Save the file
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 4. Update Database
            // We save the path relative to our server, e.g., "uploads/filename.jpg"
            product.setImageUrl("uploads/" + fileName);
            Product updatedProduct = productRepository.save(product);

            log.info("Image uploaded for Product ID: {}", id); // <--- Logging
            return toProductResponse(updatedProduct);

        } catch (IOException ex) {
            log.error("Could not store file", ex); // <--- Logging Error
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload file");
        }
    }

    // --- 2. READ (Get All) ---
    public Page<ProductResponse> getAllProducts(String search, String category, boolean isStaff, Pageable pageable) {
        Page<Product> productsPage;

        if (search != null && !search.isBlank()) {
            productsPage = isStaff 
                ? productRepository.findByNameContainingIgnoreCase(search, pageable)
                : productRepository.findByNameContainingIgnoreCaseAndActiveTrue(search, pageable);
        } 
        else if (category != null && !category.isBlank()) {
             productsPage = isStaff
                ? productRepository.findByCategory(category, pageable)
                : productRepository.findByCategoryAndActiveTrue(category, pageable);
        }
        else {
            productsPage = isStaff
                ? productRepository.findAll(pageable)
                : productRepository.findByActiveTrue(pageable);
        }

        return productsPage.map(this::toProductResponse);
    }

    // --- 3. READ (Get One) ---
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toProductResponse(product);
    }

    // --- 4. UPDATE ---
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(request.category());
        product.setPrice(request.price());

        log.info("Product updated: ID {}", id);
        return toProductResponse(productRepository.save(product));
    }

    // --- 5. DELETE ---
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        product.setActive(false);
        productRepository.save(product);
        log.warn("Product deactivated: ID {}", id);
    }

    private ProductResponse toProductResponse(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getSku(),
            product.getName(),
            product.getDescription(),
            product.getCategory(),
            product.getPrice(),
            product.isActive(),
            product.getImageUrl() // <--- Added this
        );
    }
}