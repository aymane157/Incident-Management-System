package com.entreprise.incidentmanagement.dto;

import com.entreprise.incidentmanagement.domain.IncidentLevel;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record ClientRequest(
        String description,
        Long applicationId,
        Long createdById,
        IncidentLevel incidentLevel,
        List<MultipartFile> attachments
) {
}
