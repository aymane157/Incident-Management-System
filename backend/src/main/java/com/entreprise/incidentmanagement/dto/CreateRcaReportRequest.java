package com.entreprise.incidentmanagement.dto;

public record CreateRcaReportRequest(
        Long incidentId,
        Long authorId,
        String rootCause,
        String solution,
        String preventiveMeasures
) {
}
