package com.entreprise.incidentmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    // Chaque application est rattachée à une équipe pour chaque compétence
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_team_id")
    private Team appTeam; // équipe applicative

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_team_id")
    private Team systemTeam; // équipe système

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "database_team_id")
    private Team databaseTeam; // équipe base de données

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "network_team_id")
    private Team networkTeam; // équipe réseau
}
