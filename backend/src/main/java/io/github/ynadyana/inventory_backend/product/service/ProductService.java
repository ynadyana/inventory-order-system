package io.github.ynadyana.inventory_backend.product.service;

import io.github.ynadyana.inventory_backend.inventory.Inventory;
import io.github.ynadyana.inventory_backend.inventory.InventoryRepository; // <--- Import this
import io.github.ynadyana.inventory_backend.inventory.InventoryService;
import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.dto.ProductResponse;
import io.github.ynadyana.inventory_backend.product.model.Product;
import io.github.ynadyana.inventory_backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository; // <--- Add this

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    // --- 1. CREATE WITH IMAGE ---
    public ProductResponse createProductWithImage(String name, String description, BigDecimal price, Integer stock, String category, MultipartFile image) throws IOException {
        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            Files.createDirectories(fileStorageLocation);
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path targetLocation = fileStorageLocation.resolve(fileName);
            Files.copy(image.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            imageUrl = "uploads/" + fileName;
        }

        String sku = "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Product product = Product.builder()
                .sku(sku)
                .name(name)
                .description(description)
                .category(category)
                .price(price)
                .imageUrl(imageUrl)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);
        
        // Pass the stock to inventory (Fixing the null/0 issue)
        inventoryService.createInventory(savedProduct, stock != null ? stock : 0); 
        
        log.info("Product created: {} (Stock: {})", savedProduct.getName(), stock);
        return toProductResponse(savedProduct);
    }

    // --- OTHER METHODS (Read, Update, Delete) ---
    // (Keep your existing getAllProducts, getProductById, etc. logic here)

    public Page<ProductResponse> getAllProducts(String search, String category, boolean isStaff, Pageable pageable) {
        Page<Product> productsPage;
        if (search != null && !search.isBlank()) {
            productsPage = isStaff ? productRepository.findByNameContainingIgnoreCase(search, pageable)
                    : productRepository.findByNameContainingIgnoreCaseAndActiveTrue(search, pageable);
        } else if (category != null && !category.isBlank()) {
             productsPage = isStaff ? productRepository.findByCategory(category, pageable)
                : productRepository.findByCategoryAndActiveTrue(category, pageable);
        } else {
            productsPage = isStaff ? productRepository.findAll(pageable)
                : productRepository.findByActiveTrue(pageable);
        }
        return productsPage.map(this::toProductResponse);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toProductResponse(product);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(request.category());
        product.setPrice(request.price());
        return toProductResponse(productRepository.save(product));
    }

    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    public ProductResponse uploadImage(Long id, MultipartFile file) {
        // (Keep existing uploadImage logic)
        return null; // Simplify for snippet, paste your existing logic here if needed
    }
    
    // --- THE CRITICAL FIX IS HERE ---
    private ProductResponse toProductResponse(Product product) {
        // 1. Fetch the stock from Inventory Table
        Optional<Inventory> inventory = inventoryRepository.findByProductId(product.getId());
        Integer currentStock = inventory.map(Inventory::getQuantity).orElse(0);

        // 2. Return data INCLUDING the stock
        return new ProductResponse(
            product.getId(),
            product.getSku(),
            product.getName(),
            product.getDescription(),
            product.getCategory(),
            product.getPrice(),
            product.isActive(),
            product.getImageUrl(),
            currentStock // <--- Pass the real stock count
        );
    }
}