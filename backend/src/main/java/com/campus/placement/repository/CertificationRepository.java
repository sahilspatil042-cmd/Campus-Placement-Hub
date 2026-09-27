package com.campus.placement.repository;

import com.campus.placement.entity.Certification;
import com.campus.placement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByStudent(Student student);
}
