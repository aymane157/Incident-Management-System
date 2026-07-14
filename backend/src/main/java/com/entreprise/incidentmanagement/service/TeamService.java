package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Team;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.repository.TeamRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Team> findAll() {
        return teamRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Team> findById(Long id) {
        return teamRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Team> findByName(String name) {
        return teamRepository.findByName(name);
    }

    @Transactional(readOnly = true)
    public List<User> findMembersByTeam(Team team) {
        return userRepository.findByTeam(team);
    }

    @Transactional
    public Team save(Team team) {
        return teamRepository.save(team);
    }

    @Transactional
    public void deleteById(Long id) {
        teamRepository.deleteById(id);
    }
}
