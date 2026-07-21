package com.entreprise.incidentmanagement.repository;

import com.entreprise.incidentmanagement.domain.Role;
import com.entreprise.incidentmanagement.domain.Team;
import com.entreprise.incidentmanagement.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByTeam(Team team);

    Optional<User> findByRole(Role role);
}
