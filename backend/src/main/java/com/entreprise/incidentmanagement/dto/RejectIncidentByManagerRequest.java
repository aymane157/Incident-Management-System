package com.entreprise.incidentmanagement.dto;

public record RejectIncidentByManagerRequest(Long managerId, String reason) {
}