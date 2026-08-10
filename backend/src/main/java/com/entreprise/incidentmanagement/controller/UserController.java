package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.dto.UserDto;
import com.entreprise.incidentmanagement.dto.UserRequest;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public List<UserDto> findAll() {
        return userService.findAllDto();
    }

    @GetMapping("/{id}")
    public UserDto findById(@PathVariable Long id) {
        return userService.findByIdDto(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    @GetMapping("/email/{email}")
    public UserDto findByEmail(@PathVariable String email) {
        return userService.findByEmailDto(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email));
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.saveDto(userRequest));
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @RequestBody UserRequest userRequest) {
        return userService.updateDto(id, userRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (userService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("User not found with id " + id);
        }
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
