package com.campus.placement.dto;

import com.campus.placement.entity.Company;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class CompanyDto {
    private Long id;
    private String name;
    private String sector;
    private String website;
    private String description;
    private String logoUrl;
    private String location;
    private Integer employeeCount;
    private Integer foundedYear;
    private LocalDateTime createdAt;

    public static CompanyDto from(Company c) {
        return CompanyDto.builder()
            .id(c.getId()).name(c.getName()).sector(c.getSector())
            .website(c.getWebsite()).description(c.getDescription())
            .logoUrl(c.getLogoUrl()).location(c.getLocation())
            .employeeCount(c.getEmployeeCount()).foundedYear(c.getFoundedYear())
            .createdAt(c.getCreatedAt()).build();
    }

    @Data
    public static class Input {
        @NotBlank private String name;
        @NotBlank private String sector;
        private String website;
        private String description;
        private String logoUrl;
        private String location;
        private Integer employeeCount;
        private Integer foundedYear;
    }
}
