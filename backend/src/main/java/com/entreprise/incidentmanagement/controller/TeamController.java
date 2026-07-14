package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.domain.Team;
import com.entreprise.incidentmanagement.domain.User;
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
    public List<Team> findAll() {
        return teamService.findAll();
    }

    @GetMapping("/{id}")
    public Team findById(@PathVariable Long id) {
        return teamService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + id));
    }

    @GetMapping("/name/{name}")
    public Team findByName(@PathVariable String name) {
        return teamService.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with name " + name));
    }

    @GetMapping("/{id}/members")
    public List<User> findMembers(@PathVariable Long id) {
        Team team = teamService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + id));
        return teamService.findMembersByTeam(team);
    }

    @PostMapping
    public ResponseEntity<Team> create(@RequestBody Team team) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.save(team));
    }

    @PutMapping("/{id}")
    public Team update(@PathVariable Long id, @RequestBody Team team) {
        if (teamService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Team not found with id " + id);
        }
        team.setId(id);
        return teamService.save(team);
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
