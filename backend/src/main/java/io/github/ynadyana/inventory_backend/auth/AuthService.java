package io.github.ynadyana.inventory_backend.auth;

import io.github.ynadyana.inventory_backend.auth.dto.*;
import io.github.ynadyana.inventory_backend.security.JwtService;
import io.github.ynadyana.inventory_backend.user.AppUser;
import io.github.ynadyana.inventory_backend.user.Role;
import io.github.ynadyana.inventory_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new RuntimeException("Email already registered");
        }

        AppUser user = new AppUser();
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(Role.CUSTOMER);
        

        String derivedUsername = req.email().split("@")[0];
        user.setUsername(derivedUsername);

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        
        // Return username in response 
        return new AuthResponse(
            token, 
            user.getEmail(), 
            user.getRole().name(),
            user.getUsername() 
        );
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        AppUser user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);
        
        // Return username in response
        return new AuthResponse(
            token, 
            user.getEmail(), 
            user.getRole().name(),
            user.getUsername() 
        );
    }
}