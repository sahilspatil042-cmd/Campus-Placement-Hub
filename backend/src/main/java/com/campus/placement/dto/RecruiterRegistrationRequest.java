package com.campus.placement.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RecruiterRegistrationRequest {
    @Email @NotBlank private String email;
    @NotBlank @Size(min = 6) private String password;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank private String companyName;
    @NotBlank private String designation;
    private String phone;
}
