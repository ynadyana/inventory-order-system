package io.github.ynadyana.inventory_backend.product.service;

import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.model.Product;
import io.github.ynadyana.inventory_backend.product.model.ProductVariant;
import io.github.ynadyana.inventory_backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final String UPLOAD_DIR = "uploads/";

    // 1. Create Product (Base Logic)
    @Transactional
    public Product createProduct(ProductRequest request) {
        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .active(true)
                .imageUrl(request.getImageUrl())
                .build();

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> variants = request.getVariants().stream().map(vDto -> {
                ProductVariant v = new ProductVariant();
                v.setColorName(vDto.getColorName());
                v.setColorHex(vDto.getColorHex());
                v.setStock(vDto.getStock());
                v.setImageUrl(vDto.getImageUrl());
                v.setProduct(product);
                return v;
            }).collect(Collectors.toList());
            product.setVariants(variants);
        } else {
            // Default variant logic
            ProductVariant standard = new ProductVariant();
            standard.setColorName("Standard");
            standard.setStock(0);
            standard.setProduct(product);
            product.setVariants(List.of(standard));
        }

        return productRepository.save(product);
    }

    // 2. Create with Image Upload (Controller calls this)
    @Transactional
    public Product createProductWithImage(String sku, String name, java.math.BigDecimal price, Integer stock, String category, MultipartFile image) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Product product = Product.builder()
                .sku(sku)
                .name(name)
                .price(price)
                .category(category)
                .imageUrl(imageUrl)
                .active(true)
                .build();

        // Default variant since this method is for simple product creation
        ProductVariant standard = new ProductVariant();
        standard.setColorName("Standard");
        standard.setStock(stock);
        standard.setProduct(product);
        product.setVariants(List.of(standard));

        return productRepository.save(product);
    }

   // 3. Get All Products (With Filters)
    public Page<Product> getAllProducts(String search, String category, boolean activeOnly, Pageable pageable) {
        if (activeOnly) {
            if (search != null && !search.isEmpty()) return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(search, pageable);
            if (category != null && !category.isEmpty()) return productRepository.findByCategoryAndActiveTrue(category, pageable);
            return productRepository.findByActiveTrue(pageable);
        } else {
            if (search != null && !search.isEmpty()) return productRepository.findByNameContainingIgnoreCase(search, pageable);
            if (category != null && !category.isEmpty()) return productRepository.findByCategory(category, pageable);
            return productRepository.findAll(pageable);
        }
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    // 4. Update Product
    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        
        // Note: Updating variants is complex, simpler to handle separately or overwrite
        return productRepository.save(product);
    }

    // 5. Deactivate
    public void deactivateProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    // 6. Upload Image Helper
    public Product uploadImage(Long id, MultipartFile file) {
        Product product = getProductById(id);
        String fileName = saveImage(file);
        product.setImageUrl(fileName);
        return productRepository.save(product);
    }

    private String saveImage(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return "uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }
}