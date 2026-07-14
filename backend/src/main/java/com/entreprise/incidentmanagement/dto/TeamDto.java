package com.entreprise.incidentmanagement.dto;

import com.entreprise.incidentmanagement.domain.FunctionRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDto {
    private Long id;
    private String name;
    @Builder.Default
    private List<UserDto> members = new ArrayList<>();
    private FunctionRole functionRole;
    private String description;
}
