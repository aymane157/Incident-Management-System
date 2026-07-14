package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.dto.IncidentDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import com.entreprise.incidentmanagement.utils.id_generator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IncidentService {
    private final IncidentRepository incidentRepository;

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
}
