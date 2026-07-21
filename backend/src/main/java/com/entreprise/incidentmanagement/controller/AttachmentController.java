package com.entreprise.incidentmanagement.controller;

import com.entreprise.incidentmanagement.domain.Attachment;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.repository.AttachmentRepository;
import com.entreprise.incidentmanagement.service.FileStorageServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentRepository attachmentRepository;
    private final FileStorageServiceInterface fileStorageService;

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id " + id));

        Resource resource = fileStorageService.loadAsResource(attachment.getFilePath());
        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
        if (attachment.getContentType() != null && !attachment.getContentType().isBlank()) {
            contentType = MediaType.parseMediaType(attachment.getContentType());
        }

        String filename = attachment.getFileName() != null ? attachment.getFileName() : attachment.getFilePath();

        return ResponseEntity.ok()
                .contentType(contentType)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename.replace("\"", "") + "\"")
                .body(resource);
    }
}
