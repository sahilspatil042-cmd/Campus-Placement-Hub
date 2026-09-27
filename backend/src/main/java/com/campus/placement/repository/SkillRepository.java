package com.campus.placement.repository;

import com.campus.placement.entity.Skill;
import com.campus.placement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByStudent(Student student);
}
