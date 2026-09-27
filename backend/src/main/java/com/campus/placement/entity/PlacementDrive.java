package com.campus.placement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_drives")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "job_role", nullable = false)
    private String jobRole;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    private String ctc;
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    @Builder.Default
    private JobType jobType = JobType.FULL_TIME;

    @Column(name = "drive_date", nullable = false)
    private LocalDate driveDate;

    @Column(name = "last_apply_date")
    private LocalDate lastApplyDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DriveStatus status = DriveStatus.UPCOMING;

    @Column(name = "eligibility_cgpa")
    private BigDecimal eligibilityCgpa;

    @Column(name = "eligibility_branches")
    private String eligibilityBranches;

    @Column(name = "eligibility_year")
    private Integer eligibilityYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum JobType { FULL_TIME, INTERNSHIP, CONTRACT }
    public enum DriveStatus { UPCOMING, ONGOING, COMPLETED, CANCELLED }
}
