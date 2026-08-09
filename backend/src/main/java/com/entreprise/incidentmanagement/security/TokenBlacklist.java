package com.entreprise.incidentmanagement.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenBlacklist {

    private final Map<String, Instant> revoked = new ConcurrentHashMap<>();

    public void revoke(String token, Instant tokenExpiry) {
        revoked.put(token, tokenExpiry);
    }

    public boolean isRevoked(String token) {
        return revoked.containsKey(token);
    }

    // sweeps out entries whose underlying JWT would have expired anyway —
    // keeps the map from growing forever
    @Scheduled(fixedDelay = 600_000) // every 10 min
    public void purgeExpired() {
        Instant now = Instant.now();
        revoked.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
