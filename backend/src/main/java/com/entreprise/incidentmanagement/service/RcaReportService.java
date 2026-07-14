package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.RcaReport;
import com.entreprise.incidentmanagement.dto.RcaReportDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import com.entreprise.incidentmanagement.repository.RcaReportRepository;
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
        return DomainDtoMapper.toDto(save(DomainDtoMapper.toEntity(reportDto)));
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
    public void deleteById(Long id) {
        rcaReportRepository.deleteById(id);
    }
}
