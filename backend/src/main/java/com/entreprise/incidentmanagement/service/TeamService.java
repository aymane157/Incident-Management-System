package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Team;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.TeamDto;
import com.entreprise.incidentmanagement.dto.UserDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.repository.TeamRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
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

    @Transactional(readOnly = true)
    public List<TeamDto> findAllDto() {
        return findAll().stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<TeamDto> findByIdDto(Long id) {
        return findById(id).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<TeamDto> findByNameDto(String name) {
        return findByName(name).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<UserDto> findMembersByTeamIdDto(Long teamId) {
        Team team = findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        return DomainDtoMapper.toUserDtoList(findMembersByTeam(team));
    }

    @Transactional
    public Team save(Team team) {
        return teamRepository.save(team);
    }

    @Transactional
    public TeamDto saveDto(TeamDto teamDto) {
        return DomainDtoMapper.toDto(save(DomainDtoMapper.toEntity(teamDto)));
    }

    @Transactional
    public TeamDto updateDto(Long id, TeamDto teamDto) {
        Team existing = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + id));
        Team updated = DomainDtoMapper.toEntity(teamDto);
        updated.setId(existing.getId());
        return DomainDtoMapper.toDto(teamRepository.save(updated));
    }

    @Transactional
    public void deleteById(Long id) {
        teamRepository.deleteById(id);
    }
}
