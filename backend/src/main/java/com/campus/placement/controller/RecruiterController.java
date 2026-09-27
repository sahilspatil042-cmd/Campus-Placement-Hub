package com.campus.placement.controller;

import com.campus.placement.dto.*;
import com.campus.placement.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recruiters")
@RequiredArgsConstructor
public class RecruiterController {
    private final RecruiterService recruiterService;

    @GetMapping("/profile")
    public ResponseEntity<RecruiterDto> getProfile(Authentication auth) {
        return ResponseEntity.ok(recruiterService.getProfile(auth.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<RecruiterDto> updateProfile(Authentication auth, @RequestBody RecruiterDto.ProfileInput input) {
        return ResponseEntity.ok(recruiterService.updateProfile(auth.getName(), input));
    }

    @GetMapping
    public ResponseEntity<PageResponse<RecruiterDto>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(recruiterService.list(page, size));
    }

    @PatchMapping("/{id}/shortlist")
    public ResponseEntity<ApplicationDto> shortlist(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        // Delegate to application service
        return ResponseEntity.ok(null);
    }
}
