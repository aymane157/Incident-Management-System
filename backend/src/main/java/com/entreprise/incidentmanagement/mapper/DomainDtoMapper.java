package com.entreprise.incidentmanagement.mapper;

import com.entreprise.incidentmanagement.domain.Application;
import com.entreprise.incidentmanagement.domain.Attachment;
import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.domain.Notification;
import com.entreprise.incidentmanagement.domain.RcaReport;
import com.entreprise.incidentmanagement.domain.Team;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.ApplicationDto;
import com.entreprise.incidentmanagement.dto.AttachmentDto;
import com.entreprise.incidentmanagement.dto.IncidentDto;
import com.entreprise.incidentmanagement.dto.NotificationDto;
import com.entreprise.incidentmanagement.dto.RcaReportDto;
import com.entreprise.incidentmanagement.dto.TeamDto;
import com.entreprise.incidentmanagement.dto.UserDto;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public final class DomainDtoMapper {
    private DomainDtoMapper() {
    }

    public static ApplicationDto toDto(Application entity) {
        if (entity == null) {
            return null;
        }
        return ApplicationDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .clientUser(toDto(entity.getClientUser()))
                .appTeam(toDto(entity.getAppTeam()))
                .systemTeam(toDto(entity.getSystemTeam()))
                .databaseTeam(toDto(entity.getDatabaseTeam()))
                .networkTeam(toDto(entity.getNetworkTeam()))
                .build();
    }

    public static Application toEntity(ApplicationDto dto) {
        if (dto == null) {
            return null;
        }
        Application entity = Application.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .clientUser(toEntity(dto.getClientUser()))
                .build();
        entity.setId(dto.getId());
        entity.setAppTeam(toEntity(dto.getAppTeam()));
        entity.setSystemTeam(toEntity(dto.getSystemTeam()));
        entity.setDatabaseTeam(toEntity(dto.getDatabaseTeam()));
        entity.setNetworkTeam(toEntity(dto.getNetworkTeam()));
        return entity;
    }

    public static TeamDto toDto(Team entity) {
        if (entity == null) {
            return null;
        }
        return TeamDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .members(toUserDtoList(entity.getMembers()))
                .functionRole(entity.getFunctionRole())
                .description(entity.getDescription())
                .build();
    }

    public static Team toEntity(TeamDto dto) {
        if (dto == null) {
            return null;
        }
        Team team = Team.builder()
                .name(dto.getName())
                .functionRole(dto.getFunctionRole())
                .description(dto.getDescription())
                .build();
        team.setId(dto.getId());
        List<User> members = toUserEntityList(dto.getMembers());
        if (members != null) {
            members.forEach(member -> member.setTeam(team));
            team.setMembers(members);
        }
        return team;
    }

    public static UserDto toDto(User entity) {
        if (entity == null) {
            return null;
        }
        return UserDto.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .role(entity.getRole())
                .teamId(entity.getTeam() != null ? entity.getTeam().getId() : null)
                .teamName(entity.getTeam() != null ? entity.getTeam().getName() : null)
                .teamFunctionRole(entity.getTeam() != null ? entity.getTeam().getFunctionRole() : null)
                .build();
    }

    public static User toEntity(UserDto dto) {
        if (dto == null) {
            return null;
        }
        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .role(dto.getRole())
                .build();
        user.setId(dto.getId());
        if (dto.getTeamId() != null) {
            Team team = Team.builder().id(dto.getTeamId()).build();
            user.setTeam(team);
        }
        return user;
    }

    public static IncidentDto toDto(Incident entity) {
        if (entity == null) {
            return null;
        }
        return IncidentDto.builder()
                .id(entity.getId())
                .reference(entity.getReference())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .incidentLevel(entity.getIncidentLevel())
                .application(toDto(entity.getApplication()))
                .createdBy(toDto(entity.getCreatedBy()))
                .incidentManager(toDto(entity.getIncidentManager()))
                .assignedTeam(toDto(entity.getAssignedTeam()))
                .handledBy(toDto(entity.getHandledBy()))
                .rejectionReason(entity.getRejectionReason())
                .attachments(toAttachmentDtoList(entity.getAttachments()))
                .createdAt(entity.getCreatedAt())
                .validatedAt(entity.getValidatedAt())
                .assignedAt(entity.getAssignedAt())
                .resolvedAt(entity.getResolvedAt())
                .closedAt(entity.getClosedAt())
                .slaDeadline(entity.getSlaDeadline())
                .build();
    }

    public static Incident toEntity(IncidentDto dto) {
        if (dto == null) {
            return null;
        }
        Incident incident = Incident.builder()
                .reference(dto.getReference())
                .name(dto.getName())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .incidentLevel(dto.getIncidentLevel())
                .application(toEntity(dto.getApplication()))
                .createdBy(toEntity(dto.getCreatedBy()))
                .incidentManager(toEntity(dto.getIncidentManager()))
                .assignedTeam(toEntity(dto.getAssignedTeam()))
                .handledBy(toEntity(dto.getHandledBy()))
                .rejectionReason(dto.getRejectionReason())
                .createdAt(dto.getCreatedAt())
                .validatedAt(dto.getValidatedAt())
                .assignedAt(dto.getAssignedAt())
                .resolvedAt(dto.getResolvedAt())
                .closedAt(dto.getClosedAt())
                .slaDeadline(dto.getSlaDeadline())
                .build();
        incident.setId(dto.getId());
        List<Attachment> attachments = toAttachmentEntityList(dto.getAttachments());
        if (attachments != null) {
            attachments.forEach(attachment -> attachment.setIncident(incident));
            incident.setAttachments(attachments);
        }
        return incident;
    }

    public static NotificationDto toDto(Notification entity) {
        if (entity == null) {
            return null;
        }
        return NotificationDto.builder()
                .id(entity.getId())
                .recipient(toDto(entity.getRecipient()))
                .incident(toDto(entity.getIncident()))
                .type(entity.getType())
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static Notification toEntity(NotificationDto dto) {
        if (dto == null) {
            return null;
        }
        Notification notification = Notification.builder()
                .recipient(toEntity(dto.getRecipient()))
                .incident(toEntity(dto.getIncident()))
                .type(dto.getType())
                .message(dto.getMessage())
                .createdAt(dto.getCreatedAt())
                .build();
        notification.setId(dto.getId());
        return notification;
    }

    public static RcaReportDto toDto(RcaReport entity) {
        if (entity == null) {
            return null;
        }
        return RcaReportDto.builder()
                .id(entity.getId())
                .incident(toDto(entity.getIncident()))
                .author(toDto(entity.getAuthor()))
                .rootCause(entity.getRootCause())
                .solution(entity.getSolution())
                .preventiveMeasures(entity.getPreventiveMeasures())
                .validatedByManager(entity.isValidatedByManager())
                .validatedBy(toDto(entity.getValidatedBy()))
                .createdAt(entity.getCreatedAt())
                .validatedAt(entity.getValidatedAt())
                .build();
    }

    public static RcaReport toEntity(RcaReportDto dto) {
        if (dto == null) {
            return null;
        }
        RcaReport report = RcaReport.builder()
                .incident(toEntity(dto.getIncident()))
                .author(toEntity(dto.getAuthor()))
                .rootCause(dto.getRootCause())
                .solution(dto.getSolution())
                .preventiveMeasures(dto.getPreventiveMeasures())
                .validatedByManager(dto.isValidatedByManager())
                .validatedBy(toEntity(dto.getValidatedBy()))
                .createdAt(dto.getCreatedAt())
                .validatedAt(dto.getValidatedAt())
                .build();
        report.setId(dto.getId());
        return report;
    }

    public static AttachmentDto toDto(Attachment entity) {
        if (entity == null) {
            return null;
        }
        return AttachmentDto.builder()
                .id(entity.getId())
                .fileName(entity.getFileName())
                .filePath(entity.getFilePath())
                .contentType(entity.getContentType())
                .fileSize(entity.getFileSize())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }

    public static Attachment toEntity(AttachmentDto dto) {
        if (dto == null) {
            return null;
        }
        Attachment attachment = Attachment.builder()
                .fileName(dto.getFileName())
                .filePath(dto.getFilePath())
                .contentType(dto.getContentType())
                .fileSize(dto.getFileSize())
                .uploadedAt(dto.getUploadedAt())
                .build();
        attachment.setId(dto.getId());
        return attachment;
    }

    public static List<UserDto> toUserDtoList(List<User> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(DomainDtoMapper::toDto).collect(Collectors.toList());
    }

    public static List<User> toUserEntityList(List<UserDto> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream().map(DomainDtoMapper::toEntity).collect(Collectors.toList());
    }

    public static List<AttachmentDto> toAttachmentDtoList(List<Attachment> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(DomainDtoMapper::toDto).collect(Collectors.toList());
    }

    public static List<Attachment> toAttachmentEntityList(List<AttachmentDto> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream().map(DomainDtoMapper::toEntity).collect(Collectors.toList());
    }
}
