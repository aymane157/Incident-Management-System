package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Incident;
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

    @Transactional
    public RcaReport save(RcaReport report) {
        return rcaReportRepository.save(report);
    }

    @Transactional
    public RcaReportDto saveDto(RcaReportDto reportDto) {
        if (reportDto.getCreatedAt() == null) {
            reportDto.setCreatedAt(java.time.LocalDateTime.now());
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
        NotificationDto notificationDto= DomainDtoMapper.toDto(notification);
        notificationService.sendMailNotification(notificationDto,"aymanemwa@gmail.com");
    }

    @Transactional
    public RcaReportDto updateDto(Long id, RcaReportDto reportDto) {
        RcaReport existing = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found with id " + id));
        RcaReport updated = DomainDtoMapper.toEntity(reportDto);
        updated.setId(existing.getId());
        return DomainDtoMapper.toDto(rcaReportRepository.save(updated));
    }

    @Transactional
    public RcaReportDto updateStatus(Long reportId,Long incidentManagerId,boolean validation) {//validation
        RcaReport existing = findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found with id " + reportId));
        User incidentManager= userRepository.findById(incidentManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + incidentManagerId));
        existing.setValidatedBy(incidentManager);
        existing.setValidatedByManager(validation);
         rcaReportRepository.save(existing);
         return DomainDtoMapper.toDto(existing);
    }


    @Transactional
    public void deleteById(Long id) {
        rcaReportRepository.deleteById(id);
    }
}
