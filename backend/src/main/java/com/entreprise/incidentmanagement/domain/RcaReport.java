package com.entreprise.incidentmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rca_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RcaReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incident_id", nullable = false, unique = true)
    private Incident incident;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 2000)
    private String rootCause; // cause racine de l'incident

    @Column(nullable = false, length = 2000)
    private String solution; // solution / résolution apportée

    @Column(length = 2000)
    private String preventiveMeasures; // précautions / mesures préventives

    @Builder.Default
    private boolean validatedByManager = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by_id")
    private User validatedBy; // incident manager qui valide le rapport

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime validatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
