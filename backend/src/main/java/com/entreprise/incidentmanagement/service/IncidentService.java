package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Application;
import com.entreprise.incidentmanagement.domain.Attachment;
import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.ClientRequest;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.dto.IncidentDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.ApplicationRepository;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import com.entreprise.incidentmanagement.utils.id_generator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class IncidentService {
    private final IncidentRepository incidentRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final FileStorageServiceInterface fileStorageService;

    private final id_generator idGenerator;

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
    public IncidentDto updateDto(Long id, IncidentDto incidentDto) {
        Incident existing = incidentRepository.findByReference(incidentDto.getReference()) //since ref is unique
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Incident not found with reference: " + incidentDto.getReference()
                ));
        Incident updated = DomainDtoMapper.toEntity(incidentDto);
        updated.setId(existing.getId());
        updated.setReference(existing.getReference());
        updated.setStatus(existing.getStatus());
        updated.setName(existing.getName());
        updated.setDescription(existing.getDescription());

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

        User createdBy = userRepository.findById(request.createdById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id " + request.createdById()
                ));

        Incident incident = Incident.builder()
                .name(buildClientIncidentName(application, request.description()))
                .description(request.description())
                .status(IncidentStatus.NOUVEAU)
                .application(application)
                .createdBy(createdBy)
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
            return DomainDtoMapper.toDto(savedIncident);
        } catch (IOException | RuntimeException ex) {
            fileStorageService.cleanupStoredFiles(storedAttachments);
            throw new RuntimeException("Unable to save client incident", ex);
        }
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
}
