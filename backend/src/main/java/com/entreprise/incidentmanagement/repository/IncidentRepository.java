package com.entreprise.incidentmanagement.repository;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(IncidentStatus status);
    List<Incident> findByIncidentManager_Id(Long incidentManagerId);
    List<Incident> findByAssignedTeam_Id(Long teamId);
    long countByReferenceStartingWith(String prefix);
    Optional<Incident> findByReference(String reference);
}
