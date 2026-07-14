package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/incidents")
@RequiredArgsConstructor
public class IncidentController {
    private final IncidentService incidentService;

    @GetMapping
    public List<Incident> findAll() {
        return incidentService.findAll();
    }

    @GetMapping("/{id}")
    public Incident findById(@PathVariable Long id) {
        return incidentService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id " + id));
    }

    @GetMapping("/status/{status}")
    public List<Incident> findByStatus(@PathVariable IncidentStatus status) {
        return incidentService.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<Incident> create(@RequestBody Incident incident) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.save(incident));
    }

    @PutMapping("/{id}")
    public Incident update(@PathVariable Long id, @RequestBody Incident incident) {
        if (incidentService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Incident not found with id " + id);
        }
        incident.setId(id);
        return incidentService.save(incident);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (incidentService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Incident not found with id " + id);
        }
        incidentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
