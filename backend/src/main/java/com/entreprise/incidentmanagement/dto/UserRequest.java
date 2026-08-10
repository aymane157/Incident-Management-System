package com.entreprise.incidentmanagement.dto;

import com.entreprise.incidentmanagement.domain.Role;

public record UserRequest(
        Long id,
        String firstName,
        String lastName,
        String email,
        String password,
        Role role,
        Long teamId
) {
}
