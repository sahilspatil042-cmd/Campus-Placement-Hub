package com.campus.placement.controller;

import com.campus.placement.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/placements-by-company")
    public ResponseEntity<List<Map<String, Object>>> placementsByCompany() {
        return ResponseEntity.ok(analyticsService.getPlacementsByCompany());
    }

    @GetMapping("/applications-trend")
    public ResponseEntity<List<Map<String, Object>>> applicationsTrend() {
        return ResponseEntity.ok(analyticsService.getApplicationsTrend());
    }

    @GetMapping("/application-status-breakdown")
    public ResponseEntity<List<Map<String, Object>>> statusBreakdown() {
        return ResponseEntity.ok(analyticsService.getStatusBreakdown());
    }
}
