package com.campus.placement.controller;

import com.campus.placement.dto.*;
import com.campus.placement.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<PageResponse<CompanyDto>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String sector
    ) {
        return ResponseEntity.ok(companyService.list(page, size, search, sector));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CompanyDto> create(@RequestBody CompanyDto.Input input, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(input, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@PathVariable Long id, @RequestBody CompanyDto.Input input) {
        return ResponseEntity.ok(companyService.update(id, input));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        companyService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Company deleted"));
    }
}
