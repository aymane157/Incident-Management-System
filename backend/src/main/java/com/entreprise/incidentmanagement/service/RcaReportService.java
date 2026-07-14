package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.RcaReport;
import com.entreprise.incidentmanagement.repository.RcaReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RcaReportService {
    private final RcaReportRepository rcaReportRepository;

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

    @Transactional
    public RcaReport save(RcaReport report) {
        return rcaReportRepository.save(report);
    }

    @Transactional
    public void deleteById(Long id) {
        rcaReportRepository.deleteById(id);
    }
}
