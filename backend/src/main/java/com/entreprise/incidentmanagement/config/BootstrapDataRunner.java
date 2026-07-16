package com.entreprise.incidentmanagement.config;

import com.entreprise.incidentmanagement.domain.Application;
import com.entreprise.incidentmanagement.domain.Attachment;
import com.entreprise.incidentmanagement.domain.FunctionRole;
import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.IncidentLevel;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import com.entreprise.incidentmanagement.domain.Notification;
import com.entreprise.incidentmanagement.domain.NotificationType;
import com.entreprise.incidentmanagement.domain.RcaReport;
import com.entreprise.incidentmanagement.domain.Role;
import com.entreprise.incidentmanagement.domain.Team;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.repository.ApplicationRepository;
import com.entreprise.incidentmanagement.repository.AttachmentRepository;
import com.entreprise.incidentmanagement.repository.IncidentRepository;
import com.entreprise.incidentmanagement.repository.NotificationRepository;
import com.entreprise.incidentmanagement.repository.RcaReportRepository;
import com.entreprise.incidentmanagement.repository.TeamRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import com.entreprise.incidentmanagement.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class BootstrapDataRunner implements CommandLineRunner {

    private final ApplicationRepository applicationRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final AttachmentRepository attachmentRepository;
    private final NotificationRepository notificationRepository;
    private final RcaReportRepository rcaReportRepository;
    private final IncidentService incidentService;

    @Override
    @Transactional
    public void run(String... args) {
        Team applicatif = createTeamIfMissing("Support Applicatif", FunctionRole.APPLICATIF, "Equipe en charge du support applicatif");
        Team systeme = createTeamIfMissing("Support Systeme", FunctionRole.SYSTEME, "Equipe en charge des serveurs et OS");
        Team reseau = createTeamIfMissing("Support Reseau", FunctionRole.RESEAU, "Equipe en charge du reseau");
        Team securite = createTeamIfMissing("Support Securite", FunctionRole.SECURITE, "Equipe en charge de la securite");
        Team baseDonnee = createTeamIfMissing("Support Base de Donnee", FunctionRole.BASE_DONNEE, "Equipe en charge des bases de donnees");

        User admin = createUserIfMissing("Admin", "DXC", "admin@dxc.com", "admin123", Role.ADMIN, securite);
        User jean = createUserIfMissing("Jean", "Dupont", "jean.dupont@dxc.com", "client123", Role.CLIENT, null);
        User marie = createUserIfMissing("Marie", "Martin", "marie.martin@dxc.com", "manager123", Role.INCIDENT_MANAGER, applicatif);
        User thomas = createUserIfMissing("Thomas", "Bernard", "thomas.bernard@dxc.com", "team123", Role.MEMBRE_EQUIPE, systeme);
        User amina = createUserIfMissing("Amina", "El Idrissi", "amina.elidrissi@dxc.com", "rt123", Role.RESPONSABLE_TRAITEMENT, reseau);
        User nadia = createUserIfMissing("Nadia", "Benkhaled", "nadia.benkhaled@dxc.com", "base123", Role.MEMBRE_EQUIPE, baseDonnee);

        Application portailRh = createApplicationIfMissing(
                "Portail RH",
                "Application RH pour les collaborateurs",
                applicatif,
                systeme,
                baseDonnee,
                reseau
        );
        Application erpFinance = createApplicationIfMissing(
                "ERP Finance",
                "Gestion financiere et comptable",
                applicatif,
                systeme,
                baseDonnee,
                securite
        );
        Application crm = createApplicationIfMissing(
                "CRM",
                "Suivi commercial et relation client",
                applicatif,
                systeme,
                null,
                reseau
        );
        Application intranet = createApplicationIfMissing(
                "Intranet",
                "Portail interne de l'entreprise",
                applicatif,
                systeme,
                null,
                securite
        );

        seedIncidents(portailRh, erpFinance, crm, intranet, jean, marie, thomas, amina, admin, nadia);
    }

    private void seedIncidents(
            Application portailRh,
            Application erpFinance,
            Application crm,
            Application intranet,
            User jean,
            User marie,
            User thomas,
            User amina,
            User admin,
            User nadia
    ) {
        createIncidentIfMissing(
                "Incident - Portail RH - Connexion impossible",
                "Le portail RH refuse les connexions depuis ce matin.",
                portailRh,
                jean,
                marie,
                IncidentLevel.HIGH,
                IncidentStatus.EN_COURS,
                "Support Applicatif"
        );

        Incident financeIncident = createIncidentIfMissing(
                "Incident - ERP Finance - Export bloqué",
                "Les exports comptables restent bloqués lors de la génération mensuelle.",
                erpFinance,
                jean,
                marie,
                IncidentLevel.CRITICAL,
                IncidentStatus.RESOLU,
                "Support Base de Donnee"
        );

        if (financeIncident != null) {
            addAttachmentIfMissing(
                    financeIncident,
                    "capture-erp-finance.png",
                    "uploads/incidents/capture-erp-finance.png",
                    "image/png",
                    245_123L
            );

            addRcaReportIfMissing(
                    financeIncident,
                    thomas,
                    marie,
                    "Verrouillage de session prolongé sur la base de données de production.",
                    "Redémarrage contrôlé du service et purge du verrou persistant.",
                    "Ajouter une surveillance quotidienne des verrous et des jobs longs."
            );
        }

        createIncidentIfMissing(
                "Incident - CRM - Accès réseau instable",
                "Les utilisateurs CRM subissent des coupures intermittentes.",
                crm,
                jean,
                amina,
                IncidentLevel.MEDIUM,
                IncidentStatus.VALIDE,
                "Support Reseau"
        );

        createIncidentIfMissing(
                "Incident - Intranet - Mise à jour portail",
                "Demande de correction visuelle sur la page d'accueil intranet.",
                intranet,
                jean,
                marie,
                IncidentLevel.LOW,
                IncidentStatus.NOUVEAU,
                "Support Applicatif"
        );

        createNotificationIfMissing(
                marie,
                NotificationType.NOUVEL_INCIDENT,
                "Un nouvel incident de type ERP Finance a été créé et nécessite une prise en charge.",
                financeIncident
        );

        createNotificationIfMissing(
                marie,
                NotificationType.INCIDENT_AFFECTE,
                "Un incident CRM a été affecté à votre équipe applicative.",
                null
        );

        createNotificationIfMissing(
                admin,
                NotificationType.MESSAGE_RECU,
                "Le bootstrap de données a été exécuté avec succès.",
                null
        );

        createNotificationIfMissing(
                nadia,
                NotificationType.SLA_PROCHE_DEPASSEMENT,
                "Un suivi sur les bases de données est recommandé avant l'échéance SLA.",
                null
        );
    }

    private Team createTeamIfMissing(String name, FunctionRole functionRole, String description) {
        return teamRepository.findByName(name)
                .map(existing -> {
                    boolean changed = false;
                    if (existing.getFunctionRole() == null) {
                        existing.setFunctionRole(functionRole);
                        changed = true;
                    }
                    if (existing.getDescription() == null || existing.getDescription().isBlank()) {
                        existing.setDescription(description);
                        changed = true;
                    }
                    if (changed) {
                        return teamRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> teamRepository.save(
                        Team.builder()
                                .name(name)
                                .functionRole(functionRole)
                                .description(description)
                                .build()
                ));
    }

    private Application createApplicationIfMissing(
            String name,
            String description,
            Team appTeam,
            Team systemTeam,
            Team databaseTeam,
            Team networkTeam
    ) {
        return applicationRepository.findByName(name)
                .map(existing -> {
                    boolean changed = false;
                    if (existing.getDescription() == null || existing.getDescription().isBlank()) {
                        existing.setDescription(description);
                        changed = true;
                    }
                    if (existing.getAppTeam() == null && appTeam != null) {
                        existing.setAppTeam(appTeam);
                        changed = true;
                    }
                    if (existing.getSystemTeam() == null && systemTeam != null) {
                        existing.setSystemTeam(systemTeam);
                        changed = true;
                    }
                    if (existing.getDatabaseTeam() == null && databaseTeam != null) {
                        existing.setDatabaseTeam(databaseTeam);
                        changed = true;
                    }
                    if (existing.getNetworkTeam() == null && networkTeam != null) {
                        existing.setNetworkTeam(networkTeam);
                        changed = true;
                    }
                    if (changed) {
                        return applicationRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> applicationRepository.save(
                        Application.builder()
                                .name(name)
                                .description(description)
                                .appTeam(appTeam)
                                .systemTeam(systemTeam)
                                .databaseTeam(databaseTeam)
                                .networkTeam(networkTeam)
                                .build()
                ));
    }

    private User createUserIfMissing(
            String firstName,
            String lastName,
            String email,
            String password,
            Role role,
            Team team
    ) {
        return userRepository.findByEmail(email)
                .map(existing -> {
                    boolean changed = false;
                    if ((existing.getFirstName() == null || existing.getFirstName().isBlank()) && firstName != null) {
                        existing.setFirstName(firstName);
                        changed = true;
                    }
                    if ((existing.getLastName() == null || existing.getLastName().isBlank()) && lastName != null) {
                        existing.setLastName(lastName);
                        changed = true;
                    }
                    if (existing.getTeam() == null && team != null) {
                        existing.setTeam(team);
                        changed = true;
                    }
                    if (changed) {
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .firstName(firstName)
                                .lastName(lastName)
                                .email(email)
                                .password(password)
                                .role(role)
                                .team(team)
                                .build()
                ));
    }

    private Incident createIncidentIfMissing(
            String name,
            String description,
            Application application,
            User createdBy,
            User incidentManager,
            IncidentLevel level,
            IncidentStatus status,
            String assignedTeamName
    ) {
        Team assignedTeam = teamRepository.findByName(assignedTeamName).orElse(null);

        return incidentRepository.findAll().stream()
                .filter(incident -> name.equals(incident.getName()))
                .findFirst()
                .map(existing -> {
                    boolean changed = false;
                    if (existing.getDescription() == null || existing.getDescription().isBlank()) {
                        existing.setDescription(description);
                        changed = true;
                    }
                    if (existing.getApplication() == null) {
                        existing.setApplication(application);
                        changed = true;
                    }
                    if (existing.getCreatedBy() == null) {
                        existing.setCreatedBy(createdBy);
                        changed = true;
                    }
                    if (existing.getIncidentManager() == null) {
                        existing.setIncidentManager(incidentManager);
                        changed = true;
                    }
                    if (existing.getAssignedTeam() == null && assignedTeam != null) {
                        existing.setAssignedTeam(assignedTeam);
                        changed = true;
                    }
                    if (existing.getHandledBy() == null) {
                        existing.setHandledBy(incidentManager);
                        changed = true;
                    }
                    if (existing.getIncidentLevel() == null) {
                        existing.setIncidentLevel(level);
                        changed = true;
                    }
                    if (existing.getStatus() == null) {
                        existing.setStatus(status);
                        changed = true;
                    }
                    if (changed) {
                        return incidentRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> incidentService.save(
                        Incident.builder()
                                .name(name)
                                .description(description)
                                .application(application)
                                .createdBy(createdBy)
                                .incidentManager(incidentManager)
                                .assignedTeam(assignedTeam)
                                .handledBy(incidentManager)
                                .incidentLevel(level)
                                .status(status)
                                .build()
                ));
    }

    private void addAttachmentIfMissing(
            Incident incident,
            String fileName,
            String filePath,
            String contentType,
            long fileSize
    ) {
        boolean exists = attachmentRepository.findAll().stream()
                .anyMatch(attachment -> attachment.getIncident() != null
                        && incident.getId() != null
                        && incident.getId().equals(attachment.getIncident().getId())
                        && fileName.equals(attachment.getFileName()));
        if (exists) {
            return;
        }

        attachmentRepository.save(
                Attachment.builder()
                        .incident(incident)
                        .fileName(fileName)
                        .filePath(filePath)
                        .contentType(contentType)
                        .fileSize(fileSize)
                        .build()
        );
    }

    private void addRcaReportIfMissing(
            Incident incident,
            User author,
            User validatedBy,
            String rootCause,
            String solution,
            String preventiveMeasures
    ) {
        if (rcaReportRepository.findByIncident(incident).isPresent()) {
            return;
        }

        RcaReport report = RcaReport.builder()
                .incident(incident)
                .author(author)
                .validatedBy(validatedBy)
                .rootCause(rootCause)
                .solution(solution)
                .preventiveMeasures(preventiveMeasures)
                .validatedByManager(true)
                .validatedAt(LocalDateTime.now())
                .build();
        rcaReportRepository.save(report);

        incident.setIncidentLevel(IncidentLevel.CRITICAL);
        incident.setStatus(IncidentStatus.CLOTURE);
        incident.setResolvedAt(LocalDateTime.now().minusHours(4));
        incident.setClosedAt(LocalDateTime.now());
        incidentRepository.save(incident);
    }

    private void createNotificationIfMissing(User recipient, NotificationType type, String message, Incident incident) {
        boolean exists = notificationRepository.findByRecipient(recipient).stream()
                .anyMatch(notification -> notification.getType() == type && message.equals(notification.getMessage()));
        if (exists) {
            return;
        }

        notificationRepository.save(
                Notification.builder()
                        .recipient(recipient)
                        .incident(incident)
                        .type(type)
                        .message(message)
                        .build()
        );
    }
}
