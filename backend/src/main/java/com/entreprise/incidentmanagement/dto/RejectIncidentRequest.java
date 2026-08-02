package com.entreprise.incidentmanagement.dto;

public record RejectIncidentRequest(
        String reason,
        Long teamMemberId
) {
}
