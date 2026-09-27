package com.campus.placement.dto;

import com.campus.placement.entity.Recruiter;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class RecruiterDto {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String companyName;
    private String designation;
    private String phone;
    private String linkedinUrl;
    private String photoUrl;
    private boolean isVerified;
    private LocalDateTime createdAt;

    public static RecruiterDto from(Recruiter r) {
        return RecruiterDto.builder()
            .id(r.getId())
            .userId(r.getUser().getId())
            .firstName(r.getUser().getFirstName())
            .lastName(r.getUser().getLastName())
            .email(r.getUser().getEmail())
            .companyName(r.getCompanyName())
            .designation(r.getDesignation())
            .phone(r.getPhone())
            .linkedinUrl(r.getLinkedinUrl())
            .photoUrl(r.getPhotoUrl())
            .isVerified(r.isVerified())
            .createdAt(r.getCreatedAt())
            .build();
    }

    @Data
    public static class ProfileInput {
        private String firstName;
        private String lastName;
        private String designation;
        private String phone;
        private String linkedinUrl;
    }
}
