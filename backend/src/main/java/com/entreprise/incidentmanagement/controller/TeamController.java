package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.dto.TeamDto;
import com.entreprise.incidentmanagement.dto.UserDto;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.service.TeamService;
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
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @GetMapping
    public List<TeamDto> findAll() {
        return teamService.findAllDto();
    }

    @GetMapping("/{id}")
    public TeamDto findById(@PathVariable Long id) {
        return teamService.findByIdDto(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + id));
    }

    @GetMapping("/name/{name}")
    public TeamDto findByName(@PathVariable String name) {
        return teamService.findByNameDto(name)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with name " + name));
    }

    @GetMapping("/{id}/members")
    public List<UserDto> findMembers(@PathVariable Long id) {
        return teamService.findMembersByTeamIdDto(id);
    }

    @PostMapping
    public ResponseEntity<TeamDto> create(@RequestBody TeamDto teamDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.saveDto(teamDto));
    }

    @PutMapping("/{id}")
    public TeamDto update(@PathVariable Long id, @RequestBody TeamDto teamDto) {
        return teamService.updateDto(id, teamDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (teamService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Team not found with id " + id);
        }
        teamService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
