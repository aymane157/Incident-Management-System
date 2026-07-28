package com.entreprise.incidentmanagement.service;

import com.entreprise.incidentmanagement.domain.Notification;
import com.entreprise.incidentmanagement.domain.User;
import com.entreprise.incidentmanagement.dto.NotificationDto;
import com.entreprise.incidentmanagement.mapper.DomainDtoMapper;
import com.entreprise.incidentmanagement.exception.ResourceNotFoundException;
import com.entreprise.incidentmanagement.repository.NotificationRepository;
import com.entreprise.incidentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Value("${app-frontend}")
    private String frontend;

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public NotificationDto sendMailNotification(NotificationDto notificationDto,String toEmail) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Mail sender is not configured, skipping notification email for incident {}",
                    notificationDto.getIncident() != null ? notificationDto.getIncident().getReference() : null);
            return notificationDto;
        }
        String sla="";
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("IncidentSystem");
        if(notificationDto.getIncident().getSlaDeadline() != null) {
           sla=formatDate(notificationDto.getIncident().getSlaDeadline());
            mailMessage.setSubject(notificationDto.getType().name() +" "+ "Incident:" + notificationDto.getIncident().getReference() +"With Criticality"+" "+notificationDto.getIncident().getIncidentLevel());
        }else{
            mailMessage.setSubject(notificationDto.getType().name() + "Incident:" + notificationDto.getIncident().getReference());
        }

        String message = notificationDto.getMessage()
                + "\n\n"
                +"SLA Deadline : "
                + sla
                + "\n\n"
                + "View incident: "
                + frontend
                + "/incidents/"
                + notificationDto.getIncident().getReference();
        mailMessage.setText(message);
        mailMessage.setTo(toEmail);
        log.info("Sending email to {}", toEmail);
        mailSender.send(mailMessage);

        return notificationDto;
    }
    private String formatDate(LocalDateTime date) {
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return date.format(formatter);
    }
    @Transactional(readOnly = true)
    public List<Notification> findAll() {
        return notificationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Notification> findById(Long id) {
        return notificationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> findAllDto() {
        return findAll().stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<NotificationDto> findByIdDto(Long id) {
        return findById(id).map(DomainDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<Notification> findByRecipient(User recipient) {
        if(!userRepository.findById(recipient.getId()).isPresent()) {
            throw new ResourceNotFoundException("User does not exist");
        }
        return notificationRepository.findByRecipient(recipient);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> findByRecipientIdDto(Long userId) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        return findByRecipient(recipient).stream().map(DomainDtoMapper::toDto).toList();
    }

    @Transactional
    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Transactional
    public NotificationDto saveDto(NotificationDto notificationDto) {
        return DomainDtoMapper.toDto(save(DomainDtoMapper.toEntity(notificationDto)));
    }

    @Transactional
    public NotificationDto updateDto(Long id, NotificationDto notificationDto) {
        Notification existing = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id " + id));
        Notification updated = DomainDtoMapper.toEntity(notificationDto);
        updated.setId(existing.getId());
        return DomainDtoMapper.toDto(notificationRepository.save(updated));
    }

    @Transactional
    public void deleteById(Long id) {
        notificationRepository.deleteById(id);
    }
}
