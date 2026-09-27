package com.campus.placement.dto;

import com.campus.placement.entity.Application;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ApplicationDto {
    private Long id;
    private Long studentId;
    private Long driveId;
    private StudentDto student;
    private DriveDto drive;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private String interviewDate;
    private String interviewLink;
    private String feedback;

    public static ApplicationDto from(Application a) {
        return ApplicationDto.builder()
            .id(a.getId())
            .studentId(a.getStudent().getId())
            .driveId(a.getDrive().getId())
            .student(StudentDto.from(a.getStudent()))
            .drive(DriveDto.from(a.getDrive(), 0, 0))
            .status(a.getStatus().name())
            .appliedAt(a.getAppliedAt())
            .updatedAt(a.getUpdatedAt())
            .interviewDate(a.getInterviewDate() != null ? a.getInterviewDate().toString() : null)
            .interviewLink(a.getInterviewLink())
            .feedback(a.getFeedback())
            .build();
    }

    @Data
    public static class StatusUpdate {
        private String status;
        private String interviewDate;
        private String interviewLink;
        private String feedback;
    }
}
