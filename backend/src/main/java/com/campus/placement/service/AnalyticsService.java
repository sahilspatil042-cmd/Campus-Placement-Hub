package com.campus.placement.service;

import com.campus.placement.repository.*;
import com.campus.placement.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final StudentRepository studentRepository;
    private final RecruiterRepository recruiterRepository;
    private final CompanyRepository companyRepository;
    private final PlacementDriveRepository driveRepository;
    private final ApplicationRepository applicationRepository;

    public Map<String, Object> getOverview() {
        long totalStudents = studentRepository.count();
        long placedStudents = studentRepository.countByPlacementStatus(Student.PlacementStatus.PLACED);
        long activeDrives = driveRepository.countByStatus(PlacementDrive.DriveStatus.UPCOMING) +
                            driveRepository.countByStatus(PlacementDrive.DriveStatus.ONGOING);
        long totalCompanies = companyRepository.count();
        long totalApplications = applicationRepository.count();
        long totalRecruiters = recruiterRepository.count();
        double placementRate = totalStudents > 0 ? (double) placedStudents / totalStudents * 100 : 0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStudents", totalStudents);
        result.put("placedStudents", placedStudents);
        result.put("activeDrives", activeDrives);
        result.put("totalCompanies", totalCompanies);
        result.put("totalApplications", totalApplications);
        result.put("totalRecruiters", totalRecruiters);
        result.put("placementRate", Math.round(placementRate * 10.0) / 10.0);
        result.put("averageCTC", "12 LPA");
        return result;
    }

    public List<Map<String, Object>> getPlacementsByCompany() {
        List<Object[]> raw = applicationRepository.countSelectedByCompany();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("companyName", row[0]);
            item.put("count", ((Number) row[1]).intValue());
            item.put("sector", "IT");
            result.add(item);
        }
        return result;
    }

    public List<Map<String, Object>> getApplicationsTrend() {
        List<Object[]> raw = applicationRepository.countByMonth();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("month", row[0]);
            item.put("count", ((Number) row[1]).intValue());
            result.add(item);
        }
        return result;
    }

    public List<Map<String, Object>> getStatusBreakdown() {
        List<Object[]> raw = applicationRepository.countByStatus();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("status", row[0].toString());
            item.put("count", ((Number) row[1]).intValue());
            result.add(item);
        }
        return result;
    }
}
