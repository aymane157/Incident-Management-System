package com.entreprise.incidentmanagement.dto;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record ClientRequest(
        String description,
        Long applicationId,
        Long createdById,
        List<MultipartFile> attachments
) {
}
