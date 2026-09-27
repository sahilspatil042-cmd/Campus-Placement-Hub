package com.campus.placement.service;

import com.campus.placement.dto.ApplicationDto;
import com.campus.placement.dto.PageResponse;
import com.campus.placement.entity.*;
import com.campus.placement.exception.BadRequestException;
import com.campus.placement.exception.ConflictException;
import com.campus.placement.exception.ResourceNotFoundException;
import com.campus.placement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final PlacementDriveRepository driveRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public List<ApplicationDto> getMyApplications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student student = studentRepository.findByUser(user).orElseThrow();
        return applicationRepository.findByStudent(student).stream()
            .map(ApplicationDto::from).collect(Collectors.toList());
    }

    @Transactional
    public ApplicationDto apply(String email, Long driveId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student student = studentRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        PlacementDrive drive = driveRepository.findById(driveId)
            .orElseThrow(() -> new ResourceNotFoundException("Drive not found"));

        if (applicationRepository.existsByStudentAndDrive(student, drive)) {
            throw new ConflictException("Already applied to this drive");
        }
        if (drive.getStatus() == PlacementDrive.DriveStatus.CANCELLED ||
            drive.getStatus() == PlacementDrive.DriveStatus.COMPLETED) {
            throw new BadRequestException("Drive is no longer accepting applications");
        }

        Application application = Application.builder().student(student).drive(drive).build();
        return ApplicationDto.from(applicationRepository.save(application));
    }

    @Transactional
    public void withdraw(Long applicationId, String email) {
        Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (app.getStatus() != Application.ApplicationStatus.APPLIED) {
            throw new BadRequestException("Cannot withdraw application in current status");
        }
        applicationRepository.delete(app);
    }

    @Transactional
    public ApplicationDto updateStatus(Long applicationId, Map<String, Object> data) {
        Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        String statusStr = (String) data.get("status");
        if (statusStr != null) app.setStatus(Application.ApplicationStatus.valueOf(statusStr));
        if (data.get("interviewDate") != null)
            app.setInterviewDate(LocalDateTime.parse((String) data.get("interviewDate")));
        if (data.get("interviewLink") != null) app.setInterviewLink((String) data.get("interviewLink"));
        if (data.get("feedback") != null) app.setFeedback((String) data.get("feedback"));

        Application saved = applicationRepository.save(app);

        // Notify student
        if (statusStr != null) {
            String notifMsg = switch (Application.ApplicationStatus.valueOf(statusStr)) {
                case SHORTLISTED -> "You have been shortlisted for " + app.getDrive().getTitle();
                case INTERVIEW_SCHEDULED -> "Interview scheduled for " + app.getDrive().getTitle();
                case SELECTED -> "Congratulations! You are selected for " + app.getDrive().getTitle();
                case REJECTED -> "Your application for " + app.getDrive().getTitle() + " was not selected";
                default -> "Application status updated for " + app.getDrive().getTitle();
            };
            Notification notif = Notification.builder()
                .user(app.getStudent().getUser())
                .title("Application Update")
                .message(notifMsg)
                .type(Notification.NotificationType.APPLICATION_UPDATE)
                .build();
            notificationRepository.save(notif);
        }
        return ApplicationDto.from(saved);
    }

    public PageResponse<ApplicationDto> getDriveApplicants(Long driveId) {
        PlacementDrive drive = driveRepository.findById(driveId)
            .orElseThrow(() -> new ResourceNotFoundException("Drive not found"));
        return PageResponse.from(
            applicationRepository.findByDrive(drive, PageRequest.of(0, 1000)),
            ApplicationDto::from
        );
    }
}
