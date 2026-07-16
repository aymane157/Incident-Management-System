package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Attachment;
import com.entreprise.incidentmanagement.domain.Incident;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileStorageServiceInterface {
    String store(MultipartFile file) throws IOException;
    Attachment store(MultipartFile file, Incident incident) throws IOException;
    Resource loadAsResource(String filename) throws IOException;
    boolean delete(String filename) throws IOException;
    void cleanupStoredFiles(List<Attachment> attachments);
}
