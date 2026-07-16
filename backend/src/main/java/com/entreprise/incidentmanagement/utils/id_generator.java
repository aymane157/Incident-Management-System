package com.entreprise.incidentmanagement.utils;

import com.entreprise.incidentmanagement.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class id_generator {
    private final IncidentRepository incidentRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        public String generate() {
        String today = LocalDate.now().format(FMT);
        long count = incidentRepository.countByReferenceStartingWith(today);
        return today + "-" + (count + 1);
    }
}
