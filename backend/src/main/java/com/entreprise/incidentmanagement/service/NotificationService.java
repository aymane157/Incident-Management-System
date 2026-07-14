package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Notification;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.NotificationDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.repository.NotificationRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Notification> findAll() {
        return notificationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Notification> findById(Long id) {
        return notificationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> findAllDto() {
        return findAll().stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<NotificationDto> findByIdDto(Long id) {
        return findById(id).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<Notification> findByRecipient(User recipient) {
        if(!userRepository.findById(recipient.getId()).isPresent()) {
            throw new ResourceNotFoundException("User does not exist");
        }
        return notificationRepository.findByRecipient(recipient);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> findByRecipientIdDto(Long userId) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        return findByRecipient(recipient).stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional
    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Transactional
    public NotificationDto saveDto(NotificationDto notificationDto) {
        return DomainDtoMapper.toDto(save(DomainDtoMapper.toEntity(notificationDto)));
    }

    @Transactional
    public NotificationDto updateDto(Long id, NotificationDto notificationDto) {
        Notification existing = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id " + id));
        Notification updated = DomainDtoMapper.toEntity(notificationDto);
        updated.setId(existing.getId());
        return DomainDtoMapper.toDto(notificationRepository.save(updated));
    }

    @Transactional
    public void deleteById(Long id) {
        notificationRepository.deleteById(id);
    }
}
