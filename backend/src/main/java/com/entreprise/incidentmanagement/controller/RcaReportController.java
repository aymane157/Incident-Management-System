package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.dto.RcaReportDto;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
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

    @GetMapping
    public List<RcaReportDto> findAll() {
        return rcaReportService.findAllDto();
    }

    @GetMapping("/{id}")
    public RcaReportDto findById(@PathVariable Long id) {
        return rcaReportService.findByIdDto(id)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found with id " + id));
    }

    @GetMapping("/incident/{incidentId}")
    public RcaReportDto findByIncident(@PathVariable Long incidentId) {
        return rcaReportService.findByIncidentIdDto(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("RCA report not found for incident " + incidentId));
    }

    @PostMapping
    public ResponseEntity<RcaReportDto> create(@RequestBody RcaReportDto reportDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rcaReportService.saveDto(reportDto));
    }

    @PutMapping("/{id}")
    public RcaReportDto update(@PathVariable Long id, @RequestBody RcaReportDto reportDto) {
        return rcaReportService.updateDto(id, reportDto);
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
