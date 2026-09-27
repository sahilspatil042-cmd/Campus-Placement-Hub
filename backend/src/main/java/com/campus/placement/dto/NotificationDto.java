package com.campus.placement.dto;

import com.campus.placement.entity.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private String link;
    private LocalDateTime createdAt;

    public static NotificationDto from(Notification n) {
        return NotificationDto.builder()
            .id(n.getId()).title(n.getTitle()).message(n.getMessage())
            .type(n.getType().name()).isRead(n.getIsRead())
            .link(n.getLink()).createdAt(n.getCreatedAt()).build();
    }
}
