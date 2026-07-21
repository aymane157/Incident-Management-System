package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.*;
import com.entreprise.incidentmanagement.dto.ClientRequest;
import com.entreprise.incidentmanagement.dto.NotificationDto;
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
import java.time.LocalDateTime;
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
            notificationService.sendMailNotification(savedNotification, "aymanemwa2@gmail.com");
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
                .name(buildClientIncidentName(application, request.description()))
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
            notificationService.sendMailNotification(savedNotification, "aymanemwa@gmail.com");
            return DomainDtoMapper.toDto(savedIncident);
        } catch (IOException | RuntimeException ex) {
            fileStorageService.cleanupStoredFiles(storedAttachments);
            throw new RuntimeException("Unable to save client incident", ex);
        }
    }


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

    private String buildClientIncidentName(Application application, String description) {
        String appName = application.getName() == null || application.getName().isBlank()
                ? "application"
                : application.getName();
        String shortDescription = description.trim();
        if (shortDescription.length() > 80) {
            shortDescription = shortDescription.substring(0, 80).trim();
        }
        return "Client incident - " + appName + " - " + shortDescription;
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
