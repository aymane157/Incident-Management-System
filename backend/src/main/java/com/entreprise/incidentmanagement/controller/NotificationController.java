package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.dto.NotificationDto;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.service.NotificationService;
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
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> findAll() {
        return notificationService.findAllDto();
    }

    @GetMapping("/{id}")
    public NotificationDto findById(@PathVariable Long id) {
        return notificationService.findByIdDto(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id " + id));
    }

    @GetMapping("/recipient/{userId}")
    public List<NotificationDto> findByRecipient(@PathVariable Long userId) {
        return notificationService.findByRecipientIdDto(userId);
    }

    @PostMapping
    public ResponseEntity<NotificationDto> create(@RequestBody NotificationDto notificationDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.saveDto(notificationDto));
    }

    @PutMapping("/{id}")
    public NotificationDto update(@PathVariable Long id, @RequestBody NotificationDto notificationDto) {
        return notificationService.updateDto(id, notificationDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (notificationService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Notification not found with id " + id);
        }
        notificationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
