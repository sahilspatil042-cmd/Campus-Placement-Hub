package com.campus.placement.service;

import com.campus.placement.dto.NotificationDto;
import com.campus.placement.entity.Notification;
import com.campus.placement.entity.User;
import com.campus.placement.exception.ResourceNotFoundException;
import com.campus.placement.repository.NotificationRepository;
import com.campus.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationDto> list(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
            .stream().map(NotificationDto::from).collect(Collectors.toList());
    }

    @Transactional
    public void markRead(Long id) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        notificationRepository.markAllReadByUser(user);
    }
}
