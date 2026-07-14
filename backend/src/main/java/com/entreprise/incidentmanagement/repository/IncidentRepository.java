package com.entreprise.incidentmanagement.repository;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(IncidentStatus status);
    long countByIdStartingWith(String prefix);
    Optional<Incident> findByReference(String reference);
    List<Incident> findByIncidentStatus(IncidentStatus status);
}
