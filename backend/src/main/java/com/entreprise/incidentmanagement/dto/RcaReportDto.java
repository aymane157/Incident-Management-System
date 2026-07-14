package com.entreprise.incidentmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RcaReportDto {
    private Long id;
    private IncidentDto incident;
    private UserDto author;
    private String rootCause;
    private String solution;
    private String preventiveMeasures;
    private boolean validatedByManager;
    private UserDto validatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime validatedAt;
}
