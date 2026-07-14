package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.domain.Application;
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
    public List<Application> findAll() {
        return applicationService.findAll();
    }

    @GetMapping("/{id}")
    public Application findById(@PathVariable Long id) {
        return applicationService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
    }

    @GetMapping("/name/{name}")
    public Application findByName(@PathVariable String name) {
        return applicationService.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with name " + name));
    }

    @PostMapping
    public ResponseEntity<Application> create(@RequestBody Application application) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.save(application));
    }

    @PutMapping("/{id}")
    public Application update(@PathVariable Long id, @RequestBody Application application) {
        if (applicationService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Application not found with id " + id);
        }
        application.setId(id);
        return applicationService.save(application);
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
