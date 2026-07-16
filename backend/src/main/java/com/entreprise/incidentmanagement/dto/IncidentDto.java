package com.entreprise.incidentmanagement.dto;

import com.entreprise.incidentmanagement.domain.IncidentLevel;
import com.entreprise.incidentmanagement.domain.IncidentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentDto {
    private Long id;
    private String reference;
    private String name;
    private String description;
    private IncidentStatus status;
    private IncidentLevel incidentLevel;
    private ApplicationDto application;
    private UserDto createdBy;
    private UserDto incidentManager;
    private TeamDto assignedTeam;
    private UserDto handledBy;
    private String rejectionReason;
    @Builder.Default
    private List<AttachmentDto> attachments = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime validatedAt;
    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime slaDeadline;
}
