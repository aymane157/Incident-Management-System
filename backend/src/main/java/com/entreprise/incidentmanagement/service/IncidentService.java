package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.*;
import com.entreprise.incidentmanagement.dto.ClientRequest;
import com.entreprise.incidentmanagement.dto.NotificationDto;
import com.entreprise.incidentmanagement.dto.RejectIncidentRequest;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.dto.IncidentDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.ApplicationRepository;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import com.entreprise.incidentmanagement.repository.TeamRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import com.entreprise.incidentmanagement.utils.id_generator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

import static org.springframework.data.jpa.domain.AbstractAuditable_.createdBy;

@Service
@RequiredArgsConstructor
public class IncidentService {
    private final IncidentRepository incidentRepository;
    private final ApplicationRepository applicationRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final FileStorageServiceInterface fileStorageService;
    private final NotificationService notificationService;

    private final id_generator idGenerator;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<Incident> findAll() {
        return incidentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Incident> findById(Long id) {
        return incidentRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Incident> findByStatus(IncidentStatus status) {
        return incidentRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<IncidentDto> findAllDto() {
        return findAll().stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<IncidentDto> findByIdDto(Long id) {
        return findById(id).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<IncidentDto> findByStatusDto(IncidentStatus status) {
        return findByStatus(status).stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentDto> findByIncidentManagerIdDto(Long incidentManagerId) {
        return incidentRepository.findByIncidentManager_Id(incidentManagerId).stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentDto> findByAssignedTeamIdDto(Long teamId) {
        return incidentRepository.findByAssignedTeam_Id(teamId).stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional
    public IncidentDto claimIncident(Long incidentId, Long userId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id " + incidentId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
        if (user.getTeam() == null) {
            throw new IllegalArgumentException("User is not assigned to a team");
        }
        if (incident.getAssignedTeam() != null
                && incident.getAssignedTeam().getId() != null
                && !incident.getAssignedTeam().getId().equals(user.getTeam().getId())) {
            throw new IllegalArgumentException("Incident is not assigned to the user's team");
        }

        incident.setHandledBy(user);
        if (incident.getStatus() == IncidentStatus.NEW || incident.getStatus() == IncidentStatus.VALIDATED) {
            incident.setStatus(IncidentStatus.IN_PROGRESS);
        }
        if (incident.getAssignedAt() == null) {
            incident.setAssignedAt(LocalDateTime.now());
        }

        return DomainDtoMapper.toDto(incidentRepository.save(incident));
    }

    @Transactional
    public Incident save(Incident incident) {
        incident.setReference(idGenerator.generate());
        return incidentRepository.save(incident);
    }

    @Transactional
    public IncidentDto saveDto(IncidentDto incidentDto) {
        incidentDto.setReference(idGenerator.generate());
        return DomainDtoMapper.toDto(save(DomainDtoMapper.toEntity(incidentDto)));
    }

    @Transactional
    public IncidentDto updateDto( IncidentDto incidentDto) {
        Incident existing = incidentRepository.findByReference(incidentDto.getReference()) //since ref is unique
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Incident not found with reference: " + incidentDto.getReference()
                ));
        Incident updated = DomainDtoMapper.toEntity(incidentDto);
       updated.setId(existing.getId());
        updated.setReference(existing.getReference());
        updated.setStatus(existing.getStatus());
        updated.setApplication(existing.getApplication());
        updated.setIncidentManager(existing.getIncidentManager());
        updated.setName(existing.getName());
        updated.setCreatedBy(existing.getCreatedBy());
        updated.setDescription(existing.getDescription());
        updated.setIncidentLevel(existing.getIncidentLevel());
        if (incidentDto.getAssignedTeam() != null) {
            Team assignedTeam = teamRepository.findById(incidentDto.getAssignedTeam().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Team not found with id " + incidentDto.getAssignedTeam().getId()
                    ));
            updated.setAssignedTeam(assignedTeam);
            updated.setSlaDeadline(calculateSla(incidentDto.getIncidentLevel()));
            NotificationDto notificationDto = buildClientIncidentNotification(updated,updated.getCreatedBy() );
            NotificationDto savedNotification = notificationService.saveDto(notificationDto);
            String teamMail="aymanemwa2@gmail.com";
            if (teamMail != null && !teamMail.isBlank()) {
                notificationService.sendMailNotification(savedNotification, teamMail);
            }
        } else {
            updated.setAssignedTeam(existing.getAssignedTeam());
        }

        if (incidentDto.getAssignedTeam() != null && existing.getAssignedTeam() == null) {
            updated.setAssignedAt(LocalDateTime.now());
        } else {
            updated.setAssignedAt(existing.getAssignedAt());
        }
        return DomainDtoMapper.toDto(incidentRepository.save(updated));
    }

    public IncidentDto getIncidentByReference(String reference) {
        Incident incident=incidentRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Not found with reference: " + reference));
        return DomainDtoMapper.toDto(incident);
    }

    @Transactional
    public void deleteById(Long id) {
        if(!incidentRepository.findById(id).isPresent()) {
            throw new ResourceNotFoundException("This incident does not exist");
        }
        incidentRepository.deleteById(id);
    }

    @Transactional
    public IncidentDto clientSave(ClientRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Client request is required");
        }
        if (request.description() == null || request.description().isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (request.applicationId() == null) {
            throw new IllegalArgumentException("Application id is required");
        }
        if (request.createdById() == null) {
            throw new IllegalArgumentException("Created by user id is required");
        }

        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id " + request.applicationId()
                ));
        User incidentManager=userService.fetchIncidentManager()
                .orElseThrow(() -> new ResourceNotFoundException("Incident manager not found"));
                ;
        User createdBy = userRepository.findById(request.createdById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id " + request.createdById()
                ));

        Incident incident = Incident.builder()
                .name(buildClientIncidentName(application))
                .description(request.description())
                .status(IncidentStatus.NEW)
                .application(application)
                .createdBy(createdBy)
                .incidentLevel(request.incidentLevel())
                .incidentManager(incidentManager)
                .build();

        Incident savedIncident = save(incident);
        List<Attachment> storedAttachments = new ArrayList<>();

        try {
            if (request.attachments() != null) {
                for (MultipartFile file : request.attachments()) {
                    if (file == null || file.isEmpty()) {
                        continue;
                    }
                    storedAttachments.add(fileStorageService.store(file, savedIncident));
                }
            }
            savedIncident.setAttachments(storedAttachments);
            NotificationDto notificationDto = buildClientIncidentNotification(savedIncident, createdBy);
            NotificationDto savedNotification = notificationService.saveDto(notificationDto);
            String email = incidentManager.getEmail();
            if (email != null && !email.isBlank()) {
                notificationService.sendMailNotification(savedNotification, email);
            }
            return DomainDtoMapper.toDto(savedIncident);
        } catch (IOException | RuntimeException ex) {
            fileStorageService.cleanupStoredFiles(storedAttachments);
            throw new RuntimeException("Unable to save client incident", ex);
        }
    }

    @Transactional
    public IncidentDto rejectIncidentWithReason(String reference, String reason,Long teamMemberId) {//for teammember
        User teamMember = userRepository.findById(teamMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + teamMemberId));
        Incident incident = incidentRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with reference " + reference));
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Reason is required");
        }
        if (incident.getAssignedTeam() == null) {
            throw new IllegalArgumentException("Incident is not assigned to a team");
        }
        if (teamMember.getTeam() == null || teamMember.getTeam().getId() == null) {
            throw new IllegalArgumentException("Team member is not assigned to a team");
        }
        if (!incident.getAssignedTeam().getId().equals(teamMember.getTeam().getId())) {
            throw new IllegalArgumentException("Incident is not assigned to the team member's team");
        }
        if (incident.getRcaReport() != null) {
            throw new IllegalStateException("Incident already has an RCA report");
        }

        incident.setHandledBy(teamMember);
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        incident.setAssignedAt(LocalDateTime.now());
        incident.setClosedAt(null);
        incident.setRejectionReason(reason);

        Incident savedIncident = incidentRepository.save(incident);
        notifyIncidentManagerOfRejection(savedIncident, teamMember, reason);
        return DomainDtoMapper.toDto(savedIncident);
    }

    @Transactional
    public IncidentDto rejectIncidentByManager(String reference, String reason, Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + managerId));
        Incident incident = incidentRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with reference " + reference));
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Reason is required");
        }
        if (incident.getIncidentManager() == null || incident.getIncidentManager().getId() == null) {
            throw new IllegalArgumentException("Incident manager is not assigned to this incident");
        }
        if (!incident.getIncidentManager().getId().equals(manager.getId())) {
            throw new IllegalArgumentException("Only the assigned incident manager can reject this ticket");
        }

        incident.setHandledBy(manager);
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        incident.setAssignedAt(LocalDateTime.now());
        incident.setClosedAt(null);
        incident.setRejectionReason(reason.trim());

        Incident savedIncident = incidentRepository.save(incident);
        notifyClientOfManagerRejection(savedIncident, manager, reason.trim());
        return DomainDtoMapper.toDto(savedIncident);
    }
    @Transactional
    public IncidentDto reviewIncidentRejection(String reference, Long managerId, boolean validated) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + managerId));
        Incident incident = incidentRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with reference " + reference));

        if (incident.getIncidentManager() == null || incident.getIncidentManager().getId() == null) {
            throw new IllegalArgumentException("Incident manager is not assigned to this incident");
        }
        if (!incident.getIncidentManager().getId().equals(manager.getId())) {
            throw new IllegalArgumentException("Only the assigned incident manager can review this rejection");
        }
        if (incident.getRejectionReason() == null || incident.getRejectionReason().isBlank()) {
            throw new IllegalStateException("This incident does not have a rejection to review");
        }

        incident.setStatus(validated ? IncidentStatus.REJETE : IncidentStatus.IN_PROGRESS);
        if (!validated) {
            incident.setRejectionReason(null);
        }
        incident.setValidatedAt(LocalDateTime.now());

        return DomainDtoMapper.toDto(incidentRepository.save(incident));
    }
    @Transactional
    public IncidentDto reopenRejectedIncident(String reference, Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + managerId));
        Incident incident = incidentRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with reference " + reference));

        if (incident.getIncidentManager() == null || incident.getIncidentManager().getId() == null) {
            throw new IllegalArgumentException("Incident manager is not assigned to this incident");
        }
        if (!incident.getIncidentManager().getId().equals(manager.getId())) {
            throw new IllegalArgumentException("Only the assigned incident manager can reopen this ticket");
        }
        if (incident.getStatus() != IncidentStatus.REJETE) {
            throw new IllegalStateException("Only a rejected incident can be reopened");
        }

        incident.setStatus(IncidentStatus.VALIDATED);
        incident.setRejectionReason(null);
        incident.setClosedAt(null);

        return DomainDtoMapper.toDto(incidentRepository.save(incident));
    }

    /*public IncidentDto closeIncident(){

    }*/

    private void notifyIncidentManagerOfRejection(Incident incident, User teamMember, String reason) {
        User incidentManager = incident.getIncidentManager();
        if (incidentManager == null) {
            return;
        }

        String managerEmail = incidentManager.getEmail();
        String reference = incident.getReference() == null ? "" : incident.getReference();
        String actorName = teamMember.getFirstName() == null && teamMember.getLastName() == null
                ? "a team member"
                : (teamMember.getFirstName() == null ? "" : teamMember.getFirstName() + " ")
                + (teamMember.getLastName() == null ? "" : teamMember.getLastName());
        String message = "Incident " + reference + " rejected by " + actorName.trim() + ". Reason: " + reason;

        Notification notification = Notification.builder()
                .recipient(incidentManager)
                .incident(incident)
                .type(NotificationType.INCIDENT_REJETE)
                .message(message)
                .build();

        NotificationDto notificationDto = notificationService.saveDto(DomainDtoMapper.toDto(notification));
        if (managerEmail != null && !managerEmail.isBlank()) {
            notificationService.sendMailNotification(notificationDto, managerEmail);
        }
    }

    private void notifyClientOfManagerRejection(Incident incident, User manager, String reason) {
        User client = incident.getCreatedBy();
        if (client == null) {
            return;
        }

        String clientEmail = client.getEmail();
        String reference = incident.getReference() == null ? "" : incident.getReference();
        String managerName = manager.getFirstName() == null && manager.getLastName() == null
                ? "the incident manager"
                : (manager.getFirstName() == null ? "" : manager.getFirstName() + " ")
                + (manager.getLastName() == null ? "" : manager.getLastName());
        String message = "Incident " + reference + " rejected by " + managerName.trim() + ". Reason: " + reason;

        Notification notification = Notification.builder()
                .recipient(client)
                .incident(incident)
                .type(NotificationType.INCIDENT_REJETE)
                .message(message)
                .build();

        NotificationDto notificationDto = notificationService.saveDto(DomainDtoMapper.toDto(notification));
        if (clientEmail != null && !clientEmail.isBlank()) {
            notificationService.sendMailNotification(notificationDto, clientEmail);
        }
    }
    /*public IncidentDto closeIncident(){

    }*/




    private NotificationDto buildClientIncidentNotification(Incident savedIncident, User createdBy) {
        if (createdBy.getEmail() == null || createdBy.getEmail().isBlank()) {
            throw new IllegalArgumentException("Created by user email is required");
        }

        String reference = savedIncident.getReference() == null ? "" : savedIncident.getReference();
        String applicationName = savedIncident.getApplication() != null && savedIncident.getApplication().getName() != null
                ? savedIncident.getApplication().getName()
                : "application";

        Notification notification = Notification.builder()
                .recipient(createdBy)
                .incident(savedIncident)
                .type(NotificationType.NOUVEL_INCIDENT)
                .message("Un nouvel Incident " + reference + " a ete enregistre pour " + applicationName + ".")
                .build();

        return DomainDtoMapper.toDto(notification);
    }

    private String buildClientIncidentName(Application application) {
        String appName = application.getName() == null || application.getName().isBlank()
                ? "application"
                : application.getName();

        return "Client incident - " + appName ;
    }
    private LocalDateTime calculateSla(IncidentLevel level) {
        if(level==null){
            throw new NullPointerException("level is null");
        }

        return switch (level) {
            case CRITICAL -> LocalDateTime.now().plusHours(4);
            case HIGH -> LocalDateTime.now().plusHours(6);
            case MEDIUM -> LocalDateTime.now().plusHours(8);
            case LOW -> LocalDateTime.now().plusHours(24);
        };
    }

}









