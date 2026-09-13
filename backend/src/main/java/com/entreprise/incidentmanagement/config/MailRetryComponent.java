package com.entreprise.incidentmanagement.config;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class MailRetryComponent {

    @Retryable(
            includes = MailSendException.class,  // "value = ..." also works as shorthand for this
            maxRetries = 3,
            delay = 2000,
            multiplier = 2.0,
            maxDelay = 30000,
            timeUnit = TimeUnit.MILLISECONDS
    )
    public void send(JavaMailSender mailSender, SimpleMailMessage message) {
        mailSender.send(message);
    }
}