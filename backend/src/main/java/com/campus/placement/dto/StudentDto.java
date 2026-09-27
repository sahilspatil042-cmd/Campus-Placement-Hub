package com.campus.placement.dto;

import com.campus.placement.entity.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder
public class StudentDto {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String rollNumber;
    private String branch;
    private Integer year;
    private BigDecimal cgpa;
    private String phone;
    private String address;
    private String photoUrl;
    private String resumeUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String about;
    private String placementStatus;
    private List<SkillDto> skills;
    private List<EducationDto> education;
    private List<ProjectDto> projects;
    private List<CertificationDto> certifications;
    private LocalDateTime createdAt;

    @Data @Builder
    public static class SkillDto {
        private Long id; private String name; private String level;
        public static SkillDto from(Skill s) {
            return SkillDto.builder().id(s.getId()).name(s.getName()).level(s.getLevel().name()).build();
        }
    }

    @Data @Builder
    public static class EducationDto {
        private Long id; private String institution; private String degree;
        private String fieldOfStudy; private Integer startYear; private Integer endYear;
        private String grade; private Boolean isCurrent;
        public static EducationDto from(Education e) {
            return EducationDto.builder().id(e.getId()).institution(e.getInstitution())
                .degree(e.getDegree()).fieldOfStudy(e.getFieldOfStudy()).startYear(e.getStartYear())
                .endYear(e.getEndYear()).grade(e.getGrade()).isCurrent(e.getIsCurrent()).build();
        }
    }

    @Data @Builder
    public static class ProjectDto {
        private Long id; private String title; private String description;
        private String techStack; private String projectUrl; private String githubUrl;
        private String startDate; private String endDate;
        public static ProjectDto from(Project p) {
            return ProjectDto.builder().id(p.getId()).title(p.getTitle())
                .description(p.getDescription()).techStack(p.getTechStack())
                .projectUrl(p.getProjectUrl()).githubUrl(p.getGithubUrl())
                .startDate(p.getStartDate() != null ? p.getStartDate().toString() : null)
                .endDate(p.getEndDate() != null ? p.getEndDate().toString() : null).build();
        }
    }

    @Data @Builder
    public static class CertificationDto {
        private Long id; private String name; private String issuingOrganization;
        private String issueDate; private String expiryDate; private String credentialId; private String credentialUrl;
        public static CertificationDto from(Certification c) {
            return CertificationDto.builder().id(c.getId()).name(c.getName())
                .issuingOrganization(c.getIssuingOrganization())
                .issueDate(c.getIssueDate().toString())
                .expiryDate(c.getExpiryDate() != null ? c.getExpiryDate().toString() : null)
                .credentialId(c.getCredentialId()).credentialUrl(c.getCredentialUrl()).build();
        }
    }

    public static StudentDto from(Student s) {
        return StudentDto.builder()
            .id(s.getId())
            .userId(s.getUser().getId())
            .firstName(s.getUser().getFirstName())
            .lastName(s.getUser().getLastName())
            .email(s.getUser().getEmail())
            .rollNumber(s.getRollNumber())
            .branch(s.getBranch())
            .year(s.getYear())
            .cgpa(s.getCgpa())
            .phone(s.getPhone())
            .address(s.getAddress())
            .photoUrl(s.getPhotoUrl())
            .resumeUrl(s.getResumeUrl())
            .linkedinUrl(s.getLinkedinUrl())
            .githubUrl(s.getGithubUrl())
            .portfolioUrl(s.getPortfolioUrl())
            .about(s.getAbout())
            .placementStatus(s.getPlacementStatus().name())
            .skills(s.getSkills().stream().map(SkillDto::from).collect(Collectors.toList()))
            .education(s.getEducation().stream().map(EducationDto::from).collect(Collectors.toList()))
            .projects(s.getProjects().stream().map(ProjectDto::from).collect(Collectors.toList()))
            .certifications(s.getCertifications().stream().map(CertificationDto::from).collect(Collectors.toList()))
            .createdAt(s.getCreatedAt())
            .build();
    }
}
