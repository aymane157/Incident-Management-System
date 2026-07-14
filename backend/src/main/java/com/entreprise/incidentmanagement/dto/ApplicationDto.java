package com.entreprise.incidentmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDto {
    private Long id;
    private String name;
    private String description;
    private TeamDto appTeam;
    private TeamDto systemTeam;
    private TeamDto databaseTeam;
    private TeamDto networkTeam;
}
