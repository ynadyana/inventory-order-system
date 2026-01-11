package io.github.ynadyana.inventory_backend.order.controller;

import io.github.ynadyana.inventory_backend.order.dto.OrderRequest;
import io.github.ynadyana.inventory_backend.order.model.Order;
import io.github.ynadyana.inventory_backend.order.model.OrderStatus; // Import Enum
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
    public Order placeOrder(@AuthenticationPrincipal AppUser user, @RequestBody OrderRequest request) {
        return orderService.placeOrder(user, request);
    }

    @GetMapping
    public List<Order> getOrders(@AuthenticationPrincipal AppUser user) {
        // --- FIX IS HERE: Changed 'getMyOrders' to 'getAllOrders' ---
        return orderService.getAllOrders(user);
    }

    // --- NEW ENDPOINT: Update Status (For Manage Orders Page) ---
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('STAFF')") // Only Staff can do this
    public Order updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }
}