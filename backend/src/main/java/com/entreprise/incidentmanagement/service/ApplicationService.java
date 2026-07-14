package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Application;
import com.entreprise.incidentmanagement.exception.AlreadyExistsException;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public List<Application> findAll() {
        return applicationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Application> findById(Long id) {
        return applicationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Application> findByName(String name) {//DTO
        return applicationRepository.findByName(name);
    }

    @Transactional
    public Application save(Application application) {
        if(applicationRepository.existsById(application.getId())) {
            throw new AlreadyExistsException("Application already exists");
        }
        return applicationRepository.save(application);
    }

    @Transactional
    public void deleteById(Long id) {
        if(!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found");
        }
        applicationRepository.deleteById(id);
    }
}
