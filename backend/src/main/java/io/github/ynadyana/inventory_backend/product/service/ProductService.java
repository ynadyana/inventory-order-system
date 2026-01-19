package io.github.ynadyana.inventory_backend.product.service;

import io.github.ynadyana.inventory_backend.product.dto.ProductRequest;
import io.github.ynadyana.inventory_backend.product.model.Product;
import io.github.ynadyana.inventory_backend.product.model.ProductVariant;
import io.github.ynadyana.inventory_backend.product.repository.ProductRepository;
import io.github.ynadyana.inventory_backend.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
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
    private final ProductVariantRepository productVariantRepository;
    private final String UPLOAD_DIR = "uploads/";

    // 1. Create Product (Complex with Variants)
    @Transactional
    public Product createProduct(ProductRequest request) {
        Product product = Product.builder()
                .sku(request.getSku() != null && !request.getSku().isEmpty() ? request.getSku() : "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .brand(request.getBrand()) 
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
                v.setStorage(vDto.getStorage());
                v.setPrice(vDto.getPrice());
                v.setSku(vDto.getSku());
                v.setProduct(product);
                return v;
            }).collect(Collectors.toList());
            product.setVariants(variants);
        } else {
            // Default "Simple Product" Logic
            ProductVariant standard = new ProductVariant();
            standard.setColorName(null); 
            standard.setStorage(null);   
            standard.setPrice(null);     
            standard.setStock(request.getStock() != null ? request.getStock() : 0);
            standard.setSku(product.getSku()); 
            standard.setProduct(product);
            product.setVariants(List.of(standard));
        }

        return productRepository.save(product);
    }

    // 2. Create Product With Image (Used by Controller)
    @Transactional
    public Product createProductWithImage(String sku, String name, BigDecimal price, Integer stock, String category, String brand, MultipartFile image) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Product product = Product.builder()
                .sku(sku != null ? sku : "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .name(name)
                .price(price)
                .category(category)
                .brand(brand) 
                .imageUrl(imageUrl)
                .active(true)
                .build();

        ProductVariant standard = new ProductVariant();
        standard.setColorName(null);
        standard.setStock(stock != null ? stock : 0);
        standard.setStorage(null);
        standard.setSku(product.getSku());
        standard.setProduct(product);
        product.setVariants(List.of(standard));

        return productRepository.save(product);
    }

    // 3. Add Variant
    @Transactional
    public ProductVariant addVariant(Long productId, ProductRequest.VariantDto dto, MultipartFile imageFile) {
        Product product = getProductById(productId);
        ProductVariant v = new ProductVariant();
        v.setProduct(product);
        v.setColorName(dto.getColorName());
        v.setColorHex(dto.getColorHex());
        v.setStorage(dto.getStorage());
        v.setPrice(dto.getPrice());
        v.setSku(dto.getSku());
        v.setStock(dto.getStock());

        if (imageFile != null && !imageFile.isEmpty()) {
            v.setImageUrl(saveImage(imageFile));
        }

        return productVariantRepository.save(v);
    }

    // 4. Update Variant
    @Transactional
    public ProductVariant updateVariant(Long variantId, ProductRequest.VariantDto dto) {
        ProductVariant v = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        v.setColorName(dto.getColorName());
        v.setColorHex(dto.getColorHex());
        v.setStorage(dto.getStorage());
        v.setPrice(dto.getPrice());
        v.setSku(dto.getSku());
        v.setStock(dto.getStock());
        return productVariantRepository.save(v);
    }

    // 5. Update Stock
    @Transactional
    public ProductVariant updateVariantStock(Long variantId, Integer newStock) {
        ProductVariant v = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        v.setStock(newStock);
        return productVariantRepository.save(v);
    }

    // 6. Delete Variant
    @Transactional
    public void deleteVariant(Long variantId) {
        if(!productVariantRepository.existsById(variantId)) throw new RuntimeException("Variant not found");
        productVariantRepository.deleteById(variantId);
    }

    // --- UTILS ---
    
    // 'Brand' filtering logic
    public Page<Product> getAllProducts(String search, String category, String brand, boolean activeOnly, Pageable pageable) {
        if (activeOnly) {
            
            // For simplicity, we prioritize filters in this order: Search > Brand > Category > All
            if (search != null && !search.isEmpty()) return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(search, pageable);
            if (brand != null && !brand.isEmpty()) return productRepository.findByBrandAndActiveTrue(brand, pageable); 
            if (category != null && !category.isEmpty()) return productRepository.findByCategoryAndActiveTrue(category, pageable);
            return productRepository.findByActiveTrue(pageable);
        } else {
            if (search != null && !search.isEmpty()) return productRepository.findByNameContainingIgnoreCase(search, pageable);
            if (brand != null && !brand.isEmpty()) return productRepository.findByBrand(brand, pageable); 
            if (category != null && !category.isEmpty()) return productRepository.findByCategory(category, pageable);
            return productRepository.findAll(pageable);
        }
    }

    public List<String> getAllCategories() {
        return productRepository.findAll().stream().map(Product::getCategory).distinct().collect(Collectors.toList());
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setBrand(request.getBrand()); 
        product.setPrice(request.getPrice());
        return productRepository.save(product);
    }

    public void deactivateProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }

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