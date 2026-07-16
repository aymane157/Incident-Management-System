package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Attachment;
import com.entreprise.incidentmanagement.domain.Incident;
import com.entreprise.incidentmanagement.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService implements FileStorageServiceInterface {

    private final Path root;
    private final AttachmentRepository attachmentRepository;

    public FileStorageService(@Value("${app.storage.location}") String storageLocation,
                              AttachmentRepository attachmentRepository) {
        this.root = Paths.get(storageLocation).toAbsolutePath().normalize();
        this.attachmentRepository = attachmentRepository;

        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        validateFile(file);

        String filename = sanitizeFilename(file.getOriginalFilename());

        Path target = this.root.resolve(filename).normalize();

        if (!target.startsWith(this.root)) {
            throw new SecurityException("Invalid path");
        }

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return filename;
    }

    @Override
    public Attachment store(MultipartFile file, Incident incident) throws IOException {
        if (incident == null) {
            throw new IllegalArgumentException("Incident is required to save attachment metadata");
        }
        if (incident.getId() == null) {
            throw new IllegalArgumentException("Incident must be persisted before saving attachment metadata");
        }

        String storedFilename = store(file);
        String originalFilename = file.getOriginalFilename();

        Attachment attachment = Attachment.builder()
                .incident(incident)
                .fileName(originalFilename != null ? originalFilename : storedFilename)
                .filePath(storedFilename)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .build();

        try {
            return attachmentRepository.save(attachment);
        } catch (RuntimeException ex) {
            delete(storedFilename);
            throw ex;
        }
    }


    @Override
    public Resource loadAsResource(String filename) throws IOException {
        Path file = root.resolve(filename).normalize();

        if (!file.startsWith(this.root)) {
            throw new SecurityException("Invalid path");
        }

        if (!Files.exists(file)) {
            throw new NoSuchFileException(filename);
        }

        return new UrlResource(file.toUri());
    }

    @Override
    public boolean delete(String filename) throws IOException {
        Path file = root.resolve(filename).normalize();

        if (!file.startsWith(this.root)) {
            throw new SecurityException("Invalid path");
        }

        return Files.deleteIfExists(file);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate size and content type here if needed
    }
    public void cleanupStoredFiles(List<Attachment> storedAttachments) {
        for (Attachment attachment : storedAttachments) {
            try {
                delete(attachment.getFilePath());
            } catch (IOException ignored) {
                // Best effort cleanup. The transaction will roll back the database work.
            }
        }
    }
    private String sanitizeFilename(String original) {
        String source = (original == null || original.isBlank()) ? "upload.bin" : original;

        String cleaned = Paths.get(source)
                .getFileName()
                .toString();

        return UUID.randomUUID() + "-"
                + cleaned.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
