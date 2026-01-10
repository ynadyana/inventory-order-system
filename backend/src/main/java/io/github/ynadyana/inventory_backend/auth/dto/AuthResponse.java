package io.github.ynadyana.inventory_backend.auth.dto;

public record AuthResponse(
        String token,
        String email,
        String role
) {}
