package com.entreprise.incidentmanagement.repository;

import com.entreprise.incidentmanagement.domain.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
}
