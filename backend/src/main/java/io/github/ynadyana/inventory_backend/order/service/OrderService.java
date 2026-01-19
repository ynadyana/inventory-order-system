package io.github.ynadyana.inventory_backend.order.service;

import io.github.ynadyana.inventory_backend.order.dto.OrderRequest;
import io.github.ynadyana.inventory_backend.order.dto.OrderResponse; // Import the new DTO
import io.github.ynadyana.inventory_backend.order.model.Order;
import io.github.ynadyana.inventory_backend.order.model.OrderItem;
import io.github.ynadyana.inventory_backend.order.model.OrderStatus;
import io.github.ynadyana.inventory_backend.order.repository.OrderRepository;
import io.github.ynadyana.inventory_backend.product.model.ProductVariant;
import io.github.ynadyana.inventory_backend.product.repository.ProductRepository;
import io.github.ynadyana.inventory_backend.product.repository.ProductVariantRepository;
import io.github.ynadyana.inventory_backend.user.AppUser;
import io.github.ynadyana.inventory_backend.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    public OrderResponse placeOrder(AppUser user, OrderRequest request) { 
        Order order = Order.builder()
                .user(user)
                .totalAmount(request.getTotalAmount())
                .status(OrderStatus.PENDING)
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
                    .variantName(variantName)
                    .quantity(itemRequest.getQuantity())
                    .price(itemRequest.getPrice())
                    .order(order)
                    .build();
            
            items.add(orderItem);
        }

        order.setItems(items);
        Order savedOrder = orderRepository.save(order);
        
        // Convert to DTO using helper method
        return mapToResponse(savedOrder);
    }

    public List<OrderResponse> getAllOrders(AppUser user) { 
        List<Order> orders;
        if (user.getRole() == Role.STAFF) {
            orders = orderRepository.findAll();
        } else {
            orders = orderRepository.findByUser(user);
        }
        
        // Convert list of Entities to list of DTOs
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) { 
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    
    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId()) 
                .userEmail(order.getUser().getEmail()) 
                .username(order.getUser().getRealUsername())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .shippingMethod(order.getShippingMethod())
                .shippingAddress(order.getShippingAddress())
                .status(order.getStatus())
                .items(order.getItems().stream().map(item -> OrderResponse.OrderItemResponse.builder()
                        .productId(item.getProductId())
                        .productName(item.getProduct().getName()) 
                        .variantName(item.getVariantName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                        .collect(Collectors.toList()))
                .build();
    }
}