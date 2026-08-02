package com.entreprise.incidentmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RcaValidationRequest {
    private Long incidentManagerId;
    private boolean validation;
}
