package com.campus.placement.service;

import com.campus.placement.dto.DriveDto;
import com.campus.placement.dto.PageResponse;
import com.campus.placement.entity.Company;
import com.campus.placement.entity.PlacementDrive;
import com.campus.placement.entity.User;
import com.campus.placement.exception.ResourceNotFoundException;
import com.campus.placement.repository.ApplicationRepository;
import com.campus.placement.repository.CompanyRepository;
import com.campus.placement.repository.PlacementDriveRepository;
import com.campus.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PlacementDriveService {
    private final PlacementDriveRepository driveRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    public PageResponse<DriveDto> list(int page, int size, String search, String status, Long companyId) {
        PlacementDrive.DriveStatus driveStatus = status != null ? PlacementDrive.DriveStatus.valueOf(status) : null;
        Page<PlacementDrive> drives = driveRepository.findAllFiltered(
            search != null && !search.isBlank() ? search : null,
            driveStatus, companyId, PageRequest.of(page, size)
        );
        return PageResponse.from(drives, d -> DriveDto.from(d,
            (int) applicationRepository.countByDrive(d), 0));
    }

    public DriveDto getById(Long id) {
        PlacementDrive d = driveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Drive not found"));
        return DriveDto.from(d, (int) applicationRepository.countByDrive(d), 0);
    }

    @Transactional
    public DriveDto create(DriveDto.Input input, String creatorEmail) {
        Company company = companyRepository.findById(input.getCompanyId())
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        User creator = userRepository.findByEmail(creatorEmail).orElse(null);
        PlacementDrive drive = PlacementDrive.builder()
            .title(input.getTitle()).company(company).jobRole(input.getJobRole())
            .jobDescription(input.getJobDescription()).ctc(input.getCtc()).location(input.getLocation())
            .jobType(PlacementDrive.JobType.valueOf(input.getJobType()))
            .driveDate(LocalDate.parse(input.getDriveDate()))
            .lastApplyDate(input.getLastApplyDate() != null ? LocalDate.parse(input.getLastApplyDate()) : null)
            .status(PlacementDrive.DriveStatus.valueOf(input.getStatus()))
            .eligibilityCgpa(input.getEligibilityCgpa())
            .eligibilityBranches(input.getEligibilityBranches())
            .eligibilityYear(input.getEligibilityYear())
            .createdBy(creator).build();
        return DriveDto.from(driveRepository.save(drive), 0, 0);
    }

    @Transactional
    public DriveDto update(Long id, DriveDto.Input input) {
        PlacementDrive d = driveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Drive not found"));
        if (input.getTitle() != null) d.setTitle(input.getTitle());
        if (input.getCompanyId() != null) {
            Company c = companyRepository.findById(input.getCompanyId()).orElseThrow();
            d.setCompany(c);
        }
        if (input.getJobRole() != null) d.setJobRole(input.getJobRole());
        if (input.getJobDescription() != null) d.setJobDescription(input.getJobDescription());
        if (input.getCtc() != null) d.setCtc(input.getCtc());
        if (input.getLocation() != null) d.setLocation(input.getLocation());
        if (input.getJobType() != null) d.setJobType(PlacementDrive.JobType.valueOf(input.getJobType()));
        if (input.getDriveDate() != null) d.setDriveDate(LocalDate.parse(input.getDriveDate()));
        if (input.getLastApplyDate() != null) d.setLastApplyDate(LocalDate.parse(input.getLastApplyDate()));
        if (input.getStatus() != null) d.setStatus(PlacementDrive.DriveStatus.valueOf(input.getStatus()));
        if (input.getEligibilityCgpa() != null) d.setEligibilityCgpa(input.getEligibilityCgpa());
        if (input.getEligibilityBranches() != null) d.setEligibilityBranches(input.getEligibilityBranches());
        if (input.getEligibilityYear() != null) d.setEligibilityYear(input.getEligibilityYear());
        return DriveDto.from(driveRepository.save(d), (int) applicationRepository.countByDrive(d), 0);
    }

    @Transactional
    public void delete(Long id) {
        if (!driveRepository.existsById(id)) throw new ResourceNotFoundException("Drive not found");
        driveRepository.deleteById(id);
    }
}
