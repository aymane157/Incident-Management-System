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
public class AttachmentDto {
    private Long id;
    private String fileName;
    private String filePath;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}
