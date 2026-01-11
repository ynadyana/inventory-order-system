package io.github.ynadyana.inventory_backend.order.controller;

import io.github.ynadyana.inventory_backend.order.dto.OrderRequest;
import io.github.ynadyana.inventory_backend.order.model.Order;
import io.github.ynadyana.inventory_backend.order.service.OrderService;
import io.github.ynadyana.inventory_backend.user.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()") // Fix: Allows your current user to buy immediately
    public Order placeOrder(@AuthenticationPrincipal AppUser user, @RequestBody OrderRequest request) {
        return orderService.placeOrder(user, request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()") // Fix: Allows your current user to see their history
    public List<Order> getMyOrders(@AuthenticationPrincipal AppUser user) {
        return orderService.getMyOrders(user);
    }
}