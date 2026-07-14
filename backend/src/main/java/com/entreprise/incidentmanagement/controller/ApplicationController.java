package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.dto.ApplicationDto;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.service.ApplicationService;
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
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @GetMapping
    public List<ApplicationDto> findAll() {
        return applicationService.findAllDto();
    }

    @GetMapping("/{id}")
    public ApplicationDto findById(@PathVariable Long id) {
        return applicationService.findByIdDto(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
    }

    @GetMapping("/name/{name}")
    public ApplicationDto findByName(@PathVariable String name) {
        return applicationService.findByNameDto(name)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with name " + name));
    }

    @PostMapping
    public ResponseEntity<ApplicationDto> create(@RequestBody ApplicationDto applicationDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.saveDto(applicationDto));
    }

    @PutMapping("/{id}")
    public ApplicationDto update(@PathVariable Long id, @RequestBody ApplicationDto applicationDto) {
        return applicationService.updateDto(id, applicationDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (applicationService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Application not found with id " + id);
        }
        applicationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
