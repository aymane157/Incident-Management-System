package com.entreprise.incidentmanagement.repository;

import com.entreprise.incidentmanagement.domain.Notification;
import com.entreprise.incidentmanagement.domain.NotificationType;
import com.entreprise.incidentmanagement.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipient(User recipient);

    boolean existsByIncident_IdAndType(Long incidentId, NotificationType type);
}
