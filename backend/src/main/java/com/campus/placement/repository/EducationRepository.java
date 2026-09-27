package com.campus.placement.repository;

import com.campus.placement.entity.Education;
import com.campus.placement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByStudent(Student student);
}
