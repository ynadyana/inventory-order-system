package io.github.ynadyana.inventory_backend.order.service;

import io.github.ynadyana.inventory_backend.order.dto.OrderRequest;
import io.github.ynadyana.inventory_backend.order.model.Order;
import io.github.ynadyana.inventory_backend.order.model.OrderItem;
import io.github.ynadyana.inventory_backend.order.model.OrderStatus;
import io.github.ynadyana.inventory_backend.order.repository.OrderRepository;
import io.github.ynadyana.inventory_backend.product.model.Product;
import io.github.ynadyana.inventory_backend.product.model.ProductVariant;
import io.github.ynadyana.inventory_backend.product.repository.ProductRepository;
import io.github.ynadyana.inventory_backend.product.repository.ProductVariantRepository; // Correct Import
import io.github.ynadyana.inventory_backend.user.AppUser;
import io.github.ynadyana.inventory_backend.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    // REMOVED: private final InventoryService inventoryService; 
    private final ProductVariantRepository productVariantRepository; // Added this

    @Transactional
    public Order placeOrder(AppUser user, OrderRequest request) {
        Order order = Order.builder()
                .user(user)
                .totalAmount(request.getTotalAmount())
                .status(OrderStatus.COMPLETED)
                .orderDate(LocalDateTime.now())
                .shippingMethod(request.getShippingMethod())
                .shippingAddress(request.getShippingAddress())
                .build();

        List<OrderItem> items = new ArrayList<>();

        for (var itemRequest : request.getItems()) {
            
            // 1. Determine Variant Name
            String rawVariant = itemRequest.getVariantName();
            final String variantName = (rawVariant == null || rawVariant.trim().isEmpty()) 
                                       ? "Standard" 
                                       : rawVariant;

            // 2. Find the SPECIFIC Variant
            ProductVariant variant = productVariantRepository.findByProductIdAndColorName(
                itemRequest.getProductId(), 
                variantName
            ).orElseThrow(() -> new RuntimeException("Product Variant not found: " + variantName));

            // 3. Check Stock
            if (variant.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + variant.getProduct().getName() + " (" + variantName + ")");
            }

            // 4. Deduct Stock
            variant.setStock(variant.getStock() - itemRequest.getQuantity());
            productVariantRepository.save(variant);

            // 5. Create Order Item
            OrderItem orderItem = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .product(variant.getProduct())
                    .variantName(variantName) // Ensure OrderItem has this field
                    .quantity(itemRequest.getQuantity())
                    .price(itemRequest.getPrice())
                    .order(order)
                    .build();
            
            items.add(orderItem);
        }

        order.setItems(items);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders(AppUser user) {
        if (user.getRole() == Role.STAFF) {
            return orderRepository.findAll();
        }
        return orderRepository.findByUser(user);
    }

    public Order updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
}