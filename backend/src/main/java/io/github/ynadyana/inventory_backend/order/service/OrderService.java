package io.github.ynadyana.inventory_backend.order.service;

import io.github.ynadyana.inventory_backend.inventory.InventoryService;
import io.github.ynadyana.inventory_backend.order.dto.OrderRequest;
import io.github.ynadyana.inventory_backend.order.model.*;
import io.github.ynadyana.inventory_backend.order.repository.OrderRepository;
import io.github.ynadyana.inventory_backend.product.model.Product;
import io.github.ynadyana.inventory_backend.product.repository.ProductRepository;
import io.github.ynadyana.inventory_backend.user.AppUser;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional // If anything fails, roll back everything (don't deduct stock if order fails)
    public Order placeOrder(AppUser user, OrderRequest request) {
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.COMPLETED);
        order.setItems(new ArrayList<>());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (var itemRequest : request.items()) {
            // 1. Get Product
            Product product = productRepository.findBySku(itemRequest.sku())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

            // 2. Reduce Stock (This will throw exception if not enough stock)
            // We pass negative quantity to "updateStock" to reduce it
            inventoryService.updateStock(itemRequest.sku(), -itemRequest.quantity());

            // 3. Create Order Item
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .priceAtTimeOfOrder(product.getPrice())
                    .build();

            order.getItems().add(orderItem);

            // 4. Calculate Total
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }
    
    public List<Order> getMyOrders(AppUser user) {
        return orderRepository.findByUser(user);
    }
}