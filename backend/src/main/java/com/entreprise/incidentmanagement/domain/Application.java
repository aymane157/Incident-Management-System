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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_user_id")
    private User clientUser;

    // Chaque application est rattachÃ©e Ã  une Ã©quipe pour chaque compÃ©tence
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_team_id")
    private Team appTeam; // Ã©quipe applicative

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_team_id")
    private Team systemTeam; // Ã©quipe systÃ¨me

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "database_team_id")
    private Team databaseTeam; // Ã©quipe base de donnÃ©es

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "network_team_id")
    private Team networkTeam; // Ã©quipe rÃ©seau
}
