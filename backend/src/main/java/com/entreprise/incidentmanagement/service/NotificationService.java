package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Notification;
import com.entreprise.incidentmanagement.domain.NotificationType;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.NotificationDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.repository.NotificationRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import static com.entreprise.incidentmanagement.domain.NotificationType.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Value("${app-frontend:http://localhost:5173}")
    private String frontend;

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Async("notificationExecutor")
    public CompletableFuture<NotificationDto> sendMailNotification(NotificationDto notificationDto, String toEmail) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            log.warn(
                    "Mail sender is not configured, skipping notification email for incident {}",
                    notificationDto.getIncident() != null
                            ? notificationDto.getIncident().getReference()
                            : null
            );
            return CompletableFuture.completedFuture(notificationDto);
        }

        SimpleMailMessage mailMessage = new SimpleMailMessage();

        // Use a valid email address here
        mailMessage.setFrom("no-reply@DxcIncident.com");
        mailMessage.setTo(toEmail);

        NotificationType type = notificationDto.getType();

        String subject;
        StringBuilder message = new StringBuilder();

        // Customize subject based on notification type
        if (type == INCIDENT_REJETE
                || type == INCIDENT_AFFECTE
                || type == INCIDENT_RESOLU
                || type == INCIDENT_CLOTURE) {

            subject = type.name()
                    + " - Incident "
                    + notificationDto.getIncident().getReference()
                    + " (" + notificationDto.getIncident().getIncidentLevel() + ")";
        } else {
            subject = type.name()
                    + " - Incident "
                    + notificationDto.getIncident().getReference();
        }

        message.append(notificationDto.getMessage());

        if (notificationDto.getIncident().getSlaDeadline() != null  && type !=INCIDENT_REJETE && type !=INCIDENT_CLOTURE) {
            String sla = formatDate(notificationDto.getIncident().getSlaDeadline());

            message.append("\n\n")
                    .append("SLA Deadline: ")
                    .append(sla);
        }

        message.append("\n\n")
                .append("View incident: ")
                .append(frontend)
                .append("/incidents/")
                .append(notificationDto.getIncident().getReference());

        mailMessage.setSubject(subject);
        mailMessage.setText(message.toString());

        log.info("Sending email to {}", toEmail);
        mailSender.send(mailMessage);

        return CompletableFuture.completedFuture(notificationDto);
    }

    /*public NotificationDto sendRcaMailValidation(NotificationDto notificationDto,String toEmail) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Mail sender is not configured, skipping notification email for incident {}",
                    notificationDto.getIncident() != null ? notificationDto.getIncident().getReference() : null);
            return notificationDto;
        }

    }*/
    private String formatDate(LocalDateTime date) {
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return date.format(formatter);
    }
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
