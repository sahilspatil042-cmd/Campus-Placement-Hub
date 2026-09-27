package com.campus.placement.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StudentRegistrationRequest {
    @Email @NotBlank private String email;
    @NotBlank @Size(min = 6) private String password;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank private String rollNumber;
    @NotBlank private String branch;
    @Min(1) @Max(5) private Integer year;
    private String phone;
}
