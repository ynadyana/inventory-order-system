package io.github.ynadyana.inventory_backend.order.service;

import io.github.ynadyana.inventory_backend.order.dto.OrderRequest;
import io.github.ynadyana.inventory_backend.order.model.Order;
import io.github.ynadyana.inventory_backend.order.model.OrderItem;
import io.github.ynadyana.inventory_backend.order.model.OrderStatus;
import io.github.ynadyana.inventory_backend.order.repository.OrderRepository;
import io.github.ynadyana.inventory_backend.user.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public Order placeOrder(AppUser user, OrderRequest request) {
        // 1. Create the main Order object
        Order order = Order.builder()
                .user(user)
                .totalAmount(request.getTotalAmount())
                .status(OrderStatus.COMPLETED)
                .build();

        // 2. Map the DTO items to OrderItem entities
        List<OrderItem> items = request.getItems().stream()
                .map(itemRequest -> OrderItem.builder()
                        .productId(itemRequest.getProductId())
                        .quantity(itemRequest.getQuantity())
                        .price(itemRequest.getPrice())
                        .order(order)
                        .build())
                .collect(Collectors.toList());

        // 3. Link items to order and save
        order.setItems(items);
        return orderRepository.save(order);
    }

    public List<Order> getMyOrders(AppUser user) {
        return orderRepository.findByUser(user);
    }
}