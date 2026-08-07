package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlaMonitoringService {
    private final IncidentRepository incidentRepository;

    @Transactional
    public void evaluateSlaBreaches() {
        Instant now = Instant.now();
        // scoped to IN_PROGRESS: this watchdog only tracks resolution SLA for
        // incidents actively being worked. OPEN/ACKNOWLEDGED incidents still
        // get their response-SLA check pushed immediately from acknowledge(),
        // not from this tick — see the note below on why that split matters.
        List<Incident> candidates = incidentRepository.findByStatus(IncidentStatus.IN_PROGRESS);

        for (Incident incident : candidates) {

        }
    }
}
