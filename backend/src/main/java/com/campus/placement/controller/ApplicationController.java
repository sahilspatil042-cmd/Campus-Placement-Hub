package com.campus.placement.controller;

import com.campus.placement.dto.*;
import com.campus.placement.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<ApplicationDto>> myApplications(Authentication auth) {
        return ResponseEntity.ok(applicationService.getMyApplications(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<ApplicationDto> apply(Authentication auth, @RequestBody Map<String, Object> body) {
        Long driveId = ((Number) body.get("driveId")).longValue();
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.apply(auth.getName(), driveId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> withdraw(@PathVariable Long id, Authentication auth) {
        applicationService.withdraw(id, auth.getName());
        return ResponseEntity.ok(new MessageResponse("Application withdrawn"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationDto> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(applicationService.updateStatus(id, body));
    }
}
