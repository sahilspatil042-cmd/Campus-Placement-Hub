package com.campus.placement.controller;

import com.campus.placement.dto.*;
import com.campus.placement.service.ApplicationService;
import com.campus.placement.service.PlacementDriveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/drives")
@RequiredArgsConstructor
public class PlacementDriveController {
    private final PlacementDriveService driveService;
    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<PageResponse<DriveDto>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long companyId
    ) {
        return ResponseEntity.ok(driveService.list(page, size, search, status, companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriveDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(driveService.getById(id));
    }

    @PostMapping
    public ResponseEntity<DriveDto> create(@RequestBody DriveDto.Input input, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(driveService.create(input, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriveDto> update(@PathVariable Long id, @RequestBody DriveDto.Input input) {
        return ResponseEntity.ok(driveService.update(id, input));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        driveService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Drive deleted"));
    }

    @GetMapping("/{id}/applicants")
    public ResponseEntity<PageResponse<ApplicationDto>> getApplicants(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getDriveApplicants(id));
    }
}
