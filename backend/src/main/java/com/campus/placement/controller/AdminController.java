package com.campus.placement.controller;

import com.campus.placement.dto.*;
import com.campus.placement.entity.User;
import com.campus.placement.exception.ResourceNotFoundException;
import com.campus.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('PLACEMENT_OFFICER')")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserDto>> listUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String role,
        @RequestParam(required = false) String search
    ) {
        User.UserRole userRole = role != null ? User.UserRole.valueOf(role) : null;
        return ResponseEntity.ok(PageResponse.from(
            userRepository.findAllFiltered(userRole, search, org.springframework.data.domain.PageRequest.of(page, size)),
            UserDto::from
        ));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive((Boolean) body.get("isActive"));
        return ResponseEntity.ok(UserDto.from(userRepository.save(user)));
    }
}
