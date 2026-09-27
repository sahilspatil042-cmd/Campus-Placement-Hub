package com.campus.placement.repository;

import com.campus.placement.entity.Project;
import com.campus.placement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStudent(Student student);
}
