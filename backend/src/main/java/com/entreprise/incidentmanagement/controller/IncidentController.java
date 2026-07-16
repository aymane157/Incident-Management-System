package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.dto.ClientRequest;
import com.entreprise.incidentmanagement.dto.IncidentDto;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/incidents")
@RequiredArgsConstructor
public class IncidentController {
    private final IncidentService incidentService;

    @GetMapping
    public List<IncidentDto> findAll() {
        return incidentService.findAllDto();
    }

    @GetMapping("/{id}")
    public IncidentDto findById(@PathVariable Long id) {
        return incidentService.findByIdDto(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id " + id));
    }

    @GetMapping("/status/{status}")
    public List<IncidentDto> findByStatus(@PathVariable IncidentStatus status) {
        return incidentService.findByStatusDto(status);
    }

    @PostMapping
    public ResponseEntity<IncidentDto> create(@RequestBody IncidentDto incidentDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.saveDto(incidentDto));
    }

    @PostMapping(value = "/client", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentDto> createClientIncident(@ModelAttribute ClientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.clientSave(request));
    }

    @PutMapping("/{id}")
    public IncidentDto update(@PathVariable Long id, @RequestBody IncidentDto incidentDto) {
        return incidentService.updateDto(id, incidentDto);
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
