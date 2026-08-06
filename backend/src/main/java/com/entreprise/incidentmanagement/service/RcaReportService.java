package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.domain.Notification;
import com.entreprise.incidentmanagement.domain.NotificationType;
import com.entreprise.incidentmanagement.domain.RcaReport;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.NotificationDto;
import com.entreprise.incidentmanagement.dto.RcaReportDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import com.entreprise.incidentmanagement.repository.RcaReportRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import com.entreprise.incidentmanagement.service.NotificationService;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RcaReportService {
    private final RcaReportRepository rcaReportRepository;
    private final IncidentRepository incidentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RcaReport> findAll() {
        return rcaReportRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<RcaReport> findById(Long id) {
        return rcaReportRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<RcaReport> findByIncident(Incident incident) {
        return rcaReportRepository.findByIncident(incident);
    }

    @Transactional(readOnly = true)
    public List<RcaReportDto> findAllDto() {
        return findAll().stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<RcaReportDto> findByIdDto(Long id) {
        return findById(id).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<RcaReportDto> findByIncidentIdDto(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id " + incidentId));
        return findByIncident(incident).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<RcaReportDto> findByClientIdDto(Long clientUserId) {
        return rcaReportRepository.findByIncident_CreatedBy_IdAndSentToClientTrue(clientUserId)
                .stream()
                .map(DomainDtoMapper::toDto)
                .toList();
    }

    @Transactional
    public RcaReport save(RcaReport report) {
        return rcaReportRepository.save(report);
    }

    @Transactional
    public RcaReportDto saveDto(RcaReportDto reportDto) {
        if (reportDto == null) {
            throw new IllegalArgumentException("RCA report is required");
        }
        if (reportDto.getIncident() == null || reportDto.getIncident().getId() == null) {
            throw new IllegalArgumentException("An incident is required for the RCA report");
        }
        if (reportDto.getAuthor() == null || reportDto.getAuthor().getId() == null) {
            throw new IllegalArgumentException("An author is required for the RCA report");
        }

        Incident incident = incidentRepository.findById(reportDto.getIncident().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id " + reportDto.getIncident().getId()));
        User author = userRepository.findById(reportDto.getAuthor().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + reportDto.getAuthor().getId()));

        if (findByIncident(incident).isPresent()) {
            throw new IllegalStateException("An RCA report already exists for this incident");
        }

        LocalDateTime now = LocalDateTime.now();
        incident.setHandledBy(author);
        incident.setAssignedAt(now);
        if (incident.getStatus() != IncidentStatus.REJETE && incident.getStatus() != IncidentStatus.CLOSED) {
            incident.setStatus(IncidentStatus.IN_PROGRESS);
        }
        incidentRepository.save(incident);

        reportDto.setIncident(DomainDtoMapper.toDto(incident));
        reportDto.setAuthor(DomainDtoMapper.toDto(author));
        if (reportDto.getCreatedAt() == null) {
            reportDto.setCreatedAt(now);
        }

        RcaReport saved = save(DomainDtoMapper.toEntity(reportDto));
        notifyIncidentManager(saved);
        return DomainDtoMapper.toDto(saved);
    }

    private void notifyIncidentManager(RcaReport report) {
        if (report == null || report.getIncident() == null) {
            return;
        }

        User recipient = report.getIncident().getIncidentManager();
        if (recipient == null) {
            return;
        }

        String reference = report.getIncident().getReference();
        Notification notification = Notification.builder()
                .recipient(recipient)
                .incident(report.getIncident())
                .type(NotificationType.MESSAGE_RECU)

                .message("Nouveau RCA recu pour l'incident " + reference)
                .build();
        NotificationDto notificationDto = notificationService.saveDto(DomainDtoMapper.toDto(notification));
        String recipientEmail = recipient.getEmail();
        if (recipientEmail != null && !recipientEmail.isBlank()) {
            notificationService.sendMailNotification(notificationDto, recipientEmail);
        }
    }

    @Transactional
    public RcaReportDto updateDto(Long id, RcaReportDto reportDto) {
        RcaReport existing = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found with id " + id));
        RcaReport updated = DomainDtoMapper.toEntity(reportDto);
        updated.setId(existing.getId());
        updated.setIncident(existing.getIncident());
        updated.setAuthor(existing.getAuthor());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setValidatedAt(existing.getValidatedAt());
        updated.setValidatedByManager(false);
        updated.setValidatedBy(null);

        RcaReport saved = rcaReportRepository.save(updated);
        if (reportDto.isValidatedByManager() && reportDto.getValidatedBy() != null && reportDto.getValidatedBy().getId() != null) {
            return updateStatus(saved.getId(), reportDto.getValidatedBy().getId(), true);
        }
        return DomainDtoMapper.toDto(saved);
    }

    @Transactional
    public RcaReportDto updateStatus(Long reportId, Long incidentManagerId, boolean validation) {
        RcaReport existing = findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found with id " + reportId));
        if (!validation) {
            return DomainDtoMapper.toDto(existing);
        }
        User incidentManager= userRepository.findById(incidentManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + incidentManagerId));

        if (existing.isValidatedByManager()) {
            return DomainDtoMapper.toDto(existing);
        }

        existing.setValidatedBy(incidentManager);
        existing.setValidatedByManager(validation);
        existing.setValidatedAt(LocalDateTime.now());

        RcaReport saved = rcaReportRepository.save(existing);
        return DomainDtoMapper.toDto(saved);
    }

    @Transactional
    public RcaReportDto sendToClient(Long reportId, Long managerId) {
        RcaReport report = findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found with id " + reportId));
        Incident incident = report.getIncident();
        if (incident == null || incident.getIncidentManager() == null || !incident.getIncidentManager().getId().equals(managerId)) {
            throw new IllegalArgumentException("Only the incident manager can send this RCA");
        }
        if (!report.isValidatedByManager()) {
            throw new IllegalStateException("The RCA must be validated before it can be sent");
        }
        if (incident.getCreatedBy() == null) {
            throw new ResourceNotFoundException("Client not found for RCA report " + reportId);
        }

        LocalDateTime now = LocalDateTime.now();
        report.setSentToClient(true);
        report.setSentToClientAt(now);
        report.setRejectedByClient(false);
        report.setClientRejectionReason(null);
        report.setClientRejectedAt(null);

        incident.setStatus(IncidentStatus.CLOSED);
        incident.setValidatedAt(now);
        incident.setClosedAt(now);
        incidentRepository.save(incident);

        RcaReport saved = rcaReportRepository.save(report);
        notifyClientOfValidation(saved);
        return DomainDtoMapper.toDto(saved);
    }

    @Transactional
    public RcaReportDto rejectByClient(Long reportId, Long clientId, String reason) {
        RcaReport report = findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found with id " + reportId));
        if (!report.isSentToClient() || report.getIncident() == null || report.getIncident().getCreatedBy() == null || !report.getIncident().getCreatedBy().getId().equals(clientId)) {
            throw new IllegalArgumentException("This RCA is not available for this client");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A rejection reason is required");
        }

        report.setRejectedByClient(true);
        report.setClientRejectionReason(reason.trim());
        report.setClientRejectedAt(LocalDateTime.now());
        report.setSentToClient(false);

        RcaReport saved = rcaReportRepository.save(report);
        User manager = saved.getIncident().getIncidentManager();
        if (manager != null) {
            Notification notification = Notification.builder()
                    .recipient(manager)
                    .incident(saved.getIncident())
                    .type(NotificationType.MESSAGE_RECU)
                    .message("Client rejected RCA for incident " + saved.getIncident().getReference() + ". Reason: " + reason.trim())
                    .build();
            notificationService.saveDto(DomainDtoMapper.toDto(notification));
        }
        return DomainDtoMapper.toDto(saved);
    }

    private void notifyClientOfValidation(RcaReport report) {
        if (report == null || report.getIncident() == null) {
            return;
        }

        User recipient = report.getIncident().getCreatedBy();
        if (recipient == null) {
            return;
        }

        String clientEmail = recipient.getEmail();

        Notification notification = Notification.builder()
                .recipient(recipient)
                .incident(report.getIncident())
                .type(NotificationType.INCIDENT_CLOTURE)
                .message("RCA disponible pour l'incident " + report.getIncident().getReference()
                        + ". Il est maintenant visible sur votre page client.")
                .build();

        NotificationDto notificationDto = notificationService.saveDto(DomainDtoMapper.toDto(notification));
        if (clientEmail != null && !clientEmail.isBlank()) {
            notificationService.sendMailNotification(notificationDto, clientEmail);
        }
    }

    @Transactional
    public void deleteById(Long id) {
        rcaReportRepository.deleteById(id);
    }
}

