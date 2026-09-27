package com.campus.placement.dto;

import com.campus.placement.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private boolean isActive;
    private LocalDateTime createdAt;

    public static UserDto from(User user) {
        return UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole().name())
            .isActive(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
