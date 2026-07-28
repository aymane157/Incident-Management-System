package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Role;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.UserDto;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

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
    public UserDto saveDto(UserDto userDto) {
        return DomainDtoMapper.toDto(save(DomainDtoMapper.toEntity(userDto)));
    }

    @Transactional
    public UserDto updateDto(Long id, UserDto userDto) {
        User existing = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        User updated = DomainDtoMapper.toEntity(userDto);
        updated.setId(existing.getId());
        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            updated.setPassword(existing.getPassword());
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
