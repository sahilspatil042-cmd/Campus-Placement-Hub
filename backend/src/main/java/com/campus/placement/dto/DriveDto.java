package com.campus.placement.dto;

import com.campus.placement.entity.PlacementDrive;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class DriveDto {
    private Long id;
    private String title;
    private Long companyId;
    private CompanyDto company;
    private String jobRole;
    private String jobDescription;
    private String ctc;
    private String location;
    private String jobType;
    private String driveDate;
    private String lastApplyDate;
    private String status;
    private BigDecimal eligibilityCgpa;
    private String eligibilityBranches;
    private Integer eligibilityYear;
    private int totalApplicants;
    private int totalSelected;
    private LocalDateTime createdAt;

    public static DriveDto from(PlacementDrive d, int totalApplicants, int totalSelected) {
        return DriveDto.builder()
            .id(d.getId()).title(d.getTitle())
            .companyId(d.getCompany() != null ? d.getCompany().getId() : null)
            .company(d.getCompany() != null ? CompanyDto.from(d.getCompany()) : null)
            .jobRole(d.getJobRole()).jobDescription(d.getJobDescription())
            .ctc(d.getCtc()).location(d.getLocation())
            .jobType(d.getJobType().name())
            .driveDate(d.getDriveDate().toString())
            .lastApplyDate(d.getLastApplyDate() != null ? d.getLastApplyDate().toString() : null)
            .status(d.getStatus().name())
            .eligibilityCgpa(d.getEligibilityCgpa())
            .eligibilityBranches(d.getEligibilityBranches())
            .eligibilityYear(d.getEligibilityYear())
            .totalApplicants(totalApplicants)
            .totalSelected(totalSelected)
            .createdAt(d.getCreatedAt())
            .build();
    }

    @Data
    public static class Input {
        @NotBlank private String title;
        @NotNull private Long companyId;
        @NotBlank private String jobRole;
        private String jobDescription;
        private String ctc;
        private String location;
        @NotBlank private String jobType;
        @NotBlank private String driveDate;
        private String lastApplyDate;
        @NotBlank private String status;
        private BigDecimal eligibilityCgpa;
        private String eligibilityBranches;
        private Integer eligibilityYear;
    }
}
