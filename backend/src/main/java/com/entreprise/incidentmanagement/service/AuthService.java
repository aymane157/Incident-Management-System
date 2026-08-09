package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.LoginRequest;
import com.entreprise.incidentmanagement.dto.LoginResponse;
import com.entreprise.incidentmanagement.repository.UserRepository;
import com.entreprise.incidentmanagement.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(user);
        long expiresInMs = jwtService.extractExpiration(token).toEpochMilli() - System.currentTimeMillis();

        return new LoginResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                token,
                expiresInMs,
                user.getRole()
        );
    }
}
