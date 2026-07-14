package com.entreprise.incidentmanagement.dto;

import com.entreprise.incidentmanagement.domain.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private UserDto recipient;
    private IncidentDto incident;
    private NotificationType type;
    private String message;
    private LocalDateTime createdAt;
}
