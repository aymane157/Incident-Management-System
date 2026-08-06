package com.entreprise.incidentmanagement.repository;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.RcaReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RcaReportRepository extends JpaRepository<RcaReport, Long> {
    Optional<RcaReport> findByIncident(Incident incident);
    List<RcaReport> findByIncident_CreatedBy_IdAndSentToClientTrue(Long clientUserId);
}
