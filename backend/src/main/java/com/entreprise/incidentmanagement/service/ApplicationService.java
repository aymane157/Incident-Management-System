package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Application;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.dto.ApplicationDto;
import com.entreprise.incidentmanagement.repository.ApplicationRepository;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import lombok.RequiredArgsConstructor;
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

    @Transactional(readOnly = true)
    public List<ApplicationDto> findAllDto() {
        return findAll().stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<ApplicationDto> findByIdDto(Long id) {
        return findById(id).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<ApplicationDto> findByNameDto(String name) {
        return findByName(name).map(DomainDtoMapper::toDto);
    }

    @Transactional
    public Application save(Application application) {
        return applicationRepository.save(application);
    }

    @Transactional
    public ApplicationDto saveDto(ApplicationDto applicationDto) {
        return DomainDtoMapper.toDto(save(DomainDtoMapper.toEntity(applicationDto)));
    }

    @Transactional
    public ApplicationDto updateDto(Long id, ApplicationDto applicationDto) {
        Application existing = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        Application updated = DomainDtoMapper.toEntity(applicationDto);
        updated.setId(existing.getId());
        return DomainDtoMapper.toDto(applicationRepository.save(updated));
    }

    @Transactional
    public void deleteById(Long id) {
        if(!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found");
        }
        applicationRepository.deleteById(id);
    }
}
