package io.github.ynadyana.inventory_backend.order.controller;

import io.github.ynadyana.inventory_backend.order.dto.OrderRequest;
import io.github.ynadyana.inventory_backend.order.dto.OrderResponse; // Import the new DTO
import io.github.ynadyana.inventory_backend.order.model.OrderStatus;
import io.github.ynadyana.inventory_backend.order.service.OrderService;
import io.github.ynadyana.inventory_backend.user.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class OrderController {

    private final OrderService orderService;

    // POST: Return OrderResponse
    @PostMapping
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<OrderResponse> placeOrder(@AuthenticationPrincipal AppUser user, @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.placeOrder(user, request));
    }

    // GET: Return List<OrderResponse>
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderResponse>> getOrders(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(orderService.getAllOrders(user));
    }

    // PUT: Return OrderResponse
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('STAFF')") 
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @GetMapping("/debug-permissions")
    public ResponseEntity<Object> debugPermissions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(Map.of(
            "username", auth.getName(),
            "authorities", auth.getAuthorities()
        ));
    }
}