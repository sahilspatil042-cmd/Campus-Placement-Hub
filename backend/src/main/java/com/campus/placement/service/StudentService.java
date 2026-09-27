package com.campus.placement.service;

import com.campus.placement.dto.*;
import com.campus.placement.entity.*;
import com.campus.placement.exception.ResourceNotFoundException;
import com.campus.placement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final EducationRepository educationRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;

    public PageResponse<StudentDto> listStudents(int page, int size, String search, String branch, Double cgpa, String statusStr) {
        Pageable pageable = PageRequest.of(page, size);
        Student.PlacementStatus status = statusStr != null ? Student.PlacementStatus.valueOf(statusStr) : null;
        BigDecimal cgpaBd = cgpa != null ? BigDecimal.valueOf(cgpa) : null;
        Page<Student> students = studentRepository.findAllFiltered(
            search != null && search.isBlank() ? null : search, branch, cgpaBd, status, pageable
        );
        return PageResponse.from(students, StudentDto::from);
    }

    public StudentDto getById(Long id) {
        Student s = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return StudentDto.from(s);
    }

    public StudentDto getByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student s = studentRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return StudentDto.from(s);
    }

    @Transactional
    public StudentDto updateProfile(String email, Map<String, Object> updates) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student s = studentRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));
        userRepository.save(user);

        if (updates.containsKey("phone")) s.setPhone((String) updates.get("phone"));
        if (updates.containsKey("address")) s.setAddress((String) updates.get("address"));
        if (updates.containsKey("about")) s.setAbout((String) updates.get("about"));
        if (updates.containsKey("linkedinUrl")) s.setLinkedinUrl((String) updates.get("linkedinUrl"));
        if (updates.containsKey("githubUrl")) s.setGithubUrl((String) updates.get("githubUrl"));
        if (updates.containsKey("portfolioUrl")) s.setPortfolioUrl((String) updates.get("portfolioUrl"));
        if (updates.containsKey("cgpa")) {
            Object cgpaVal = updates.get("cgpa");
            s.setCgpa(cgpaVal instanceof Number ? BigDecimal.valueOf(((Number) cgpaVal).doubleValue()) : null);
        }
        if (updates.containsKey("branch")) s.setBranch((String) updates.get("branch"));
        if (updates.containsKey("year")) {
            Object yearVal = updates.get("year");
            if (yearVal instanceof Number) s.setYear(((Number) yearVal).intValue());
        }
        return StudentDto.from(studentRepository.save(s));
    }

    @Transactional
    public StudentDto updateById(Long id, Map<String, Object> updates) {
        Student s = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        User user = s.getUser();
        if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));
        userRepository.save(user);
        if (updates.containsKey("phone")) s.setPhone((String) updates.get("phone"));
        if (updates.containsKey("placementStatus")) {
            s.setPlacementStatus(Student.PlacementStatus.valueOf((String) updates.get("placementStatus")));
        }
        return StudentDto.from(studentRepository.save(s));
    }

    @Transactional
    public Map<String, String> updatePhoto(String email, String url, String publicId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        s.setPhotoUrl(url);
        studentRepository.save(s);
        return Map.of("url", url, "publicId", publicId != null ? publicId : "");
    }

    @Transactional
    public Map<String, String> updateResume(String email, String url, String publicId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        s.setResumeUrl(url);
        s.setResumePublicId(publicId);
        studentRepository.save(s);
        return Map.of("url", url, "publicId", publicId != null ? publicId : "");
    }

    // SKILLS
    public List<StudentDto.SkillDto> listSkills(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        return skillRepository.findByStudent(s).stream().map(StudentDto.SkillDto::from).collect(Collectors.toList());
    }

    @Transactional
    public StudentDto.SkillDto addSkill(String email, String name, String level) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        Skill skill = Skill.builder().student(s).name(name).level(Skill.SkillLevel.valueOf(level)).build();
        return StudentDto.SkillDto.from(skillRepository.save(skill));
    }

    @Transactional
    public void deleteSkill(Long skillId, String email) {
        Skill skill = skillRepository.findById(skillId)
            .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        skillRepository.delete(skill);
    }

    // EDUCATION
    public List<StudentDto.EducationDto> listEducation(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        return educationRepository.findByStudent(s).stream().map(StudentDto.EducationDto::from).collect(Collectors.toList());
    }

    @Transactional
    public StudentDto.EducationDto addEducation(String email, Map<String, Object> data) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        Education edu = Education.builder()
            .student(s)
            .institution((String) data.get("institution"))
            .degree((String) data.get("degree"))
            .fieldOfStudy((String) data.get("fieldOfStudy"))
            .startYear(data.get("startYear") != null ? ((Number) data.get("startYear")).intValue() : null)
            .endYear(data.get("endYear") != null ? ((Number) data.get("endYear")).intValue() : null)
            .grade((String) data.get("grade"))
            .isCurrent(data.get("isCurrent") != null ? (Boolean) data.get("isCurrent") : false)
            .build();
        return StudentDto.EducationDto.from(educationRepository.save(edu));
    }

    @Transactional
    public StudentDto.EducationDto updateEducation(Long id, Map<String, Object> data) {
        Education edu = educationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Education not found"));
        if (data.containsKey("institution")) edu.setInstitution((String) data.get("institution"));
        if (data.containsKey("degree")) edu.setDegree((String) data.get("degree"));
        if (data.containsKey("fieldOfStudy")) edu.setFieldOfStudy((String) data.get("fieldOfStudy"));
        if (data.containsKey("startYear") && data.get("startYear") != null)
            edu.setStartYear(((Number) data.get("startYear")).intValue());
        if (data.containsKey("endYear") && data.get("endYear") != null)
            edu.setEndYear(((Number) data.get("endYear")).intValue());
        if (data.containsKey("grade")) edu.setGrade((String) data.get("grade"));
        if (data.containsKey("isCurrent")) edu.setIsCurrent((Boolean) data.get("isCurrent"));
        return StudentDto.EducationDto.from(educationRepository.save(edu));
    }

    @Transactional
    public void deleteEducation(Long id) {
        educationRepository.deleteById(id);
    }

    // PROJECTS
    public List<StudentDto.ProjectDto> listProjects(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        return projectRepository.findByStudent(s).stream().map(StudentDto.ProjectDto::from).collect(Collectors.toList());
    }

    @Transactional
    public StudentDto.ProjectDto addProject(String email, Map<String, Object> data) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        Project p = Project.builder()
            .student(s)
            .title((String) data.get("title"))
            .description((String) data.get("description"))
            .techStack((String) data.get("techStack"))
            .projectUrl((String) data.get("projectUrl"))
            .githubUrl((String) data.get("githubUrl"))
            .startDate(data.get("startDate") != null ? LocalDate.parse((String) data.get("startDate")) : null)
            .endDate(data.get("endDate") != null ? LocalDate.parse((String) data.get("endDate")) : null)
            .build();
        return StudentDto.ProjectDto.from(projectRepository.save(p));
    }

    @Transactional
    public StudentDto.ProjectDto updateProject(Long id, Map<String, Object> data) {
        Project p = projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (data.containsKey("title")) p.setTitle((String) data.get("title"));
        if (data.containsKey("description")) p.setDescription((String) data.get("description"));
        if (data.containsKey("techStack")) p.setTechStack((String) data.get("techStack"));
        if (data.containsKey("projectUrl")) p.setProjectUrl((String) data.get("projectUrl"));
        if (data.containsKey("githubUrl")) p.setGithubUrl((String) data.get("githubUrl"));
        if (data.containsKey("startDate") && data.get("startDate") != null)
            p.setStartDate(LocalDate.parse((String) data.get("startDate")));
        if (data.containsKey("endDate") && data.get("endDate") != null)
            p.setEndDate(LocalDate.parse((String) data.get("endDate")));
        return StudentDto.ProjectDto.from(projectRepository.save(p));
    }

    @Transactional
    public void deleteProject(Long id) { projectRepository.deleteById(id); }

    // CERTIFICATIONS
    public List<StudentDto.CertificationDto> listCertifications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        return certificationRepository.findByStudent(s).stream().map(StudentDto.CertificationDto::from).collect(Collectors.toList());
    }

    @Transactional
    public StudentDto.CertificationDto addCertification(String email, Map<String, Object> data) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Student s = studentRepository.findByUser(user).orElseThrow();
        Certification c = Certification.builder()
            .student(s).name((String) data.get("name"))
            .issuingOrganization((String) data.get("issuingOrganization"))
            .issueDate(LocalDate.parse((String) data.get("issueDate")))
            .expiryDate(data.get("expiryDate") != null ? LocalDate.parse((String) data.get("expiryDate")) : null)
            .credentialId((String) data.get("credentialId"))
            .credentialUrl((String) data.get("credentialUrl"))
            .build();
        return StudentDto.CertificationDto.from(certificationRepository.save(c));
    }

    @Transactional
    public void deleteCertification(Long id) { certificationRepository.deleteById(id); }
}
