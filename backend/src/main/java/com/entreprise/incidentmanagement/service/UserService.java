package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Role;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.UserDto;
import com.entreprise.incidentmanagement.dto.UserRequest;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<UserDto> findAllDto() {
        return findAll().stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> findByIdDto(Long id) {
        return findById(id).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> findByEmailDto(String email) {
        return findByEmail(email).map(DomainDtoMapper::toDto);
    }

    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public UserDto saveDto(UserRequest userRequest) {
        if (userRequest.password() == null || userRequest.password().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        User user = DomainDtoMapper.toEntity(userRequest);
        user.setPasswordHash(passwordEncoder.encode(userRequest.password()));
        return DomainDtoMapper.toDto(save(user));
    }

    @Transactional
    public UserDto updateDto(Long id, UserRequest userRequest) {
        User existing = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        User updated = DomainDtoMapper.toEntity(userRequest);
        updated.setId(existing.getId());
        if (userRequest.password() == null || userRequest.password().isBlank()) {
            updated.setPasswordHash(existing.getPasswordHash());
        } else {
            updated.setPasswordHash(passwordEncoder.encode(userRequest.password()));
        }
        return DomainDtoMapper.toDto(userRepository.save(updated));
    }

    @Transactional
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    public Optional<User> fetchIncidentManager() {
        Optional<User> user = userRepository.findByRole(Role.INCIDENT_MANAGER);
        return user;
    }
}
