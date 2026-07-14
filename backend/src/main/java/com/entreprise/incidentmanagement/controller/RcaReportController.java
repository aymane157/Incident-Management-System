package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.RcaReport;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.service.IncidentService;
import com.entreprise.incidentmanagement.service.RcaReportService;
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
@RequestMapping("/rca-reports")
@RequiredArgsConstructor
public class RcaReportController {
    private final RcaReportService rcaReportService;
    private final IncidentService incidentService;

    @GetMapping
    public List<RcaReport> findAll() {
        return rcaReportService.findAll();
    }

    @GetMapping("/{id}")
    public RcaReport findById(@PathVariable Long id) {
        return rcaReportService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found with id " + id));
    }

    @GetMapping("/incident/{incidentId}")
    public RcaReport findByIncident(@PathVariable Long incidentId) {
        Incident incident = incidentService.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id " + incidentId));
        return rcaReportService.findByIncident(incident)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found for incident " + incidentId));
    }

    @PostMapping
    public ResponseEntity<RcaReport> create(@RequestBody RcaReport report) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rcaReportService.save(report));
    }

    @PutMapping("/{id}")
    public RcaReport update(@PathVariable Long id, @RequestBody RcaReport report) {
        if (rcaReportService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("RCA report not found with id " + id);
        }
        report.setId(id);
        return rcaReportService.save(report);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (rcaReportService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("RCA report not found with id " + id);
        }
        rcaReportService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
