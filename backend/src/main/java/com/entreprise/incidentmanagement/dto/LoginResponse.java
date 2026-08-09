package com.entreprise.incidentmanagement.dto;

import com.entreprise.incidentmanagement.domain.Role;

public record LoginResponse(
        Long userId,
        String firstName,
        String lastName,
        String username,
        String token,
        long expiresInMs,
        Role role
) {}
