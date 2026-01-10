package io.github.ynadyana.inventory_backend.user;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal AppUser user) {
        return Map.of(
                "email", user.getEmail(),
                "role", user.getRole().name()
        );
    }
}
