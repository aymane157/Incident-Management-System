package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.exception.AlreadyExistsException;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import com.entreprise.incidentmanagement.utils.id_generator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
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

    @Transactional
    public Incident save(Incident incident) {
        if(incidentRepository.findById(incident.getId()).isPresent()) {
            throw new AlreadyExistsException("This incident already exists");
        }
        String reference=idGenerator.generate();
        incident.setReference(reference);
        return incidentRepository.save(incident);
    }

    @Transactional
    public void deleteById(Long id) {
        if(!incidentRepository.findById(id).isPresent()) {
            throw new ResourceNotFoundException("This incident does not exist");
        }
        incidentRepository.deleteById(id);
    }
}
