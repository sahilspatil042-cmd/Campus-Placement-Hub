package com.campus.placement.controller;

import com.campus.placement.dto.*;
import com.campus.placement.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> list(Authentication auth) {
        return ResponseEntity.ok(notificationService.list(auth.getName()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(new MessageResponse("Marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllRead(Authentication auth) {
        notificationService.markAllRead(auth.getName());
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
    }
}
