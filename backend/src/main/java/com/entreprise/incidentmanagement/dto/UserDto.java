package com.entreprise.incidentmanagement.dto;

import com.entreprise.incidentmanagement.domain.Role;
import com.entreprise.incidentmanagement.domain.FunctionRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
    private Long teamId;
    private String teamName;
    private FunctionRole teamFunctionRole;
}
