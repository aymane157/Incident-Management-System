package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.domain.Notification;
import com.entreprise.incidentmanagement.domain.NotificationType;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SlaMonitoringService {
    private static final Duration SLA_WARNING_WINDOW = Duration.ofMinutes(30);
    private static final Duration SLA_WARNING_WINDOW_EXTREME=Duration.ofMinutes(10);

    private final IncidentRepository incidentRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void evaluateSlaBreaches() {
        LocalDateTime now = LocalDateTime.now();
        List<Incident> candidates = incidentRepository.findByStatus(IncidentStatus.IN_PROGRESS);
        System.out.println("Evaluating");
        for (Incident incident : candidates) {
            evaluateIncident(incident, now);
        }
    }

    private void evaluateIncident(Incident incident, LocalDateTime now) {
        if (incident == null || incident.getId() == null || incident.getSlaDeadline() == null) {
            return;
        }
        if (incident.getStatus() != IncidentStatus.IN_PROGRESS) {
            return;
        }

        User recipient = resolveRecipient(incident);
        if (recipient == null) {
            log.debug("Skipping SLA evaluation for incident {} because no recipient is assigned", incident.getReference());
            return;
        }

        LocalDateTime deadline = incident.getSlaDeadline();
        System.out.println("Evaluating" + deadline);
        if (!now.isBefore(deadline)) {
            if (deadline.equals(incident.getSlaBreachedNotifiedForDeadline())) {
                return;
            }
            System.out.println("sendbreach");
            incident.setSlaBreachedNotifiedForDeadline(deadline);
            sendSlaNotification(
                    incident,
                    recipient,
                    NotificationType.SLA_DEPASSE,
                    buildBreachedMessage(incident, deadline, now)
            );
            incident.setStatus(IncidentStatus.CLOSED);

            return;
        }

        Duration remaining = Duration.between(now, deadline);
        if (remaining.compareTo(SLA_WARNING_WINDOW) <= 0) {
            System.out.println("Send warning window" );
            if (deadline.equals(incident.getSlaWarningNotifiedForDeadline())) {
                return;
            }
            incident.setSlaWarningNotifiedForDeadline(deadline);
            sendSlaNotification(
                    incident,
                    recipient,
                    NotificationType.SLA_PROCHE_DEPASSEMENT,
                    buildWarningMessage(incident, remaining)
            );
        }
        if (remaining.compareTo(SLA_WARNING_WINDOW_EXTREME) <= 0) {
            System.out.println("Send warning window" );
            if (deadline.equals(incident.getSlaWarningNotifiedForDeadline())) {
                return;
            }
            incident.setSlaWarningNotifiedForDeadline(deadline);
            sendSlaNotification(
                    incident,
                    recipient,
                    NotificationType.SLA_PROCHE_DEPASSEMENT,
                    buildWarningMessage(incident, remaining)
            );
        }
    }

    private void sendSlaNotification(
            Incident incident,
            User recipient,
            NotificationType type,
            String message
    ) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .incident(incident)
                .type(type)
                .message(message)
                .build();

        var savedNotification = notificationService.saveDto(DomainDtoMapper.toDto(notification));
        if (recipient.getEmail() != null && !recipient.getEmail().isBlank()) {
            notificationService.sendMailNotification(savedNotification, recipient.getEmail());
        }
    }

    private User resolveRecipient(Incident incident) {
        if (incident.getIncidentManager() != null) {
            return incident.getIncidentManager();
        }
        if (incident.getHandledBy() != null) {
            return incident.getHandledBy();
        }
        return incident.getCreatedBy();
    }

    private String buildWarningMessage(Incident incident, Duration remaining) {
        return "Incident " + incident.getReference()
                + " is approaching its SLA deadline. Remaining time: "
                + formatDuration(remaining)
                + ".";
    }

    private String buildBreachedMessage(Incident incident, LocalDateTime deadline, LocalDateTime now) {
        Duration overdue = Duration.between(deadline, now);
        return "Incident " + incident.getReference()
                + " has exceeded its SLA deadline by "
                + formatDuration(overdue)
                + ".";
    }

    private String formatDuration(Duration duration) {
        long totalMinutes = Math.max(duration.toMinutes(), 0);
        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;

        if (hours == 0) {
            return minutes + "m";
        }
        return hours + "h " + minutes + "m";
    }
}
