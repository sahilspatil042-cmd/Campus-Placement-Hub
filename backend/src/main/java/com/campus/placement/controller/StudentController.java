package com.campus.placement.controller;

import com.campus.placement.dto.*;
import com.campus.placement.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<PageResponse<StudentDto>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String branch,
        @RequestParam(required = false) Double cgpa,
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(studentService.listStudents(page, size, search, branch, cgpa, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDto> updateById(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(studentService.updateById(id, body));
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentDto> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(studentService.getByEmail(auth.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentDto> updateMyProfile(Authentication auth, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(studentService.updateProfile(auth.getName(), body));
    }

    @PatchMapping("/profile/photo")
    public ResponseEntity<Map<String, String>> updatePhoto(Authentication auth, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(studentService.updatePhoto(auth.getName(), body.get("url"), body.get("publicId")));
    }

    @PatchMapping("/profile/resume")
    public ResponseEntity<Map<String, String>> updateResume(Authentication auth, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(studentService.updateResume(auth.getName(), body.get("url"), body.get("publicId")));
    }

    // SKILLS
    @GetMapping("/skills")
    public ResponseEntity<List<StudentDto.SkillDto>> listSkills(Authentication auth) {
        return ResponseEntity.ok(studentService.listSkills(auth.getName()));
    }

    @PostMapping("/skills")
    public ResponseEntity<StudentDto.SkillDto> addSkill(Authentication auth, @RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(studentService.addSkill(auth.getName(), body.get("name"), body.get("level")));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<MessageResponse> deleteSkill(@PathVariable Long id, Authentication auth) {
        studentService.deleteSkill(id, auth.getName());
        return ResponseEntity.ok(new MessageResponse("Skill deleted"));
    }

    // EDUCATION
    @GetMapping("/education")
    public ResponseEntity<List<StudentDto.EducationDto>> listEducation(Authentication auth) {
        return ResponseEntity.ok(studentService.listEducation(auth.getName()));
    }

    @PostMapping("/education")
    public ResponseEntity<StudentDto.EducationDto> addEducation(Authentication auth, @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.addEducation(auth.getName(), body));
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<StudentDto.EducationDto> updateEducation(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(studentService.updateEducation(id, body));
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<MessageResponse> deleteEducation(@PathVariable Long id) {
        studentService.deleteEducation(id);
        return ResponseEntity.ok(new MessageResponse("Education deleted"));
    }

    // PROJECTS
    @GetMapping("/projects")
    public ResponseEntity<List<StudentDto.ProjectDto>> listProjects(Authentication auth) {
        return ResponseEntity.ok(studentService.listProjects(auth.getName()));
    }

    @PostMapping("/projects")
    public ResponseEntity<StudentDto.ProjectDto> addProject(Authentication auth, @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.addProject(auth.getName(), body));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<StudentDto.ProjectDto> updateProject(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(studentService.updateProject(id, body));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<MessageResponse> deleteProject(@PathVariable Long id) {
        studentService.deleteProject(id);
        return ResponseEntity.ok(new MessageResponse("Project deleted"));
    }

    // CERTIFICATIONS
    @GetMapping("/certifications")
    public ResponseEntity<List<StudentDto.CertificationDto>> listCerts(Authentication auth) {
        return ResponseEntity.ok(studentService.listCertifications(auth.getName()));
    }

    @PostMapping("/certifications")
    public ResponseEntity<StudentDto.CertificationDto> addCert(Authentication auth, @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.addCertification(auth.getName(), body));
    }

    @DeleteMapping("/certifications/{id}")
    public ResponseEntity<MessageResponse> deleteCert(@PathVariable Long id) {
        studentService.deleteCertification(id);
        return ResponseEntity.ok(new MessageResponse("Certification deleted"));
    }
}
