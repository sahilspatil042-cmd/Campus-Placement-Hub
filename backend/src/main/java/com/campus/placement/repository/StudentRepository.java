package com.campus.placement.repository;

import com.campus.placement.entity.Student;
import com.campus.placement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    boolean existsByRollNumber(String rollNumber);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE " +
           "(:search IS NULL OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:branch IS NULL OR s.branch = :branch) AND " +
           "(:cgpa IS NULL OR s.cgpa >= :cgpa) AND " +
           "(:status IS NULL OR s.placementStatus = :status)")
    Page<Student> findAllFiltered(
        @Param("search") String search,
        @Param("branch") String branch,
        @Param("cgpa") BigDecimal cgpa,
        @Param("status") Student.PlacementStatus status,
        Pageable pageable
    );

    long countByPlacementStatus(Student.PlacementStatus status);
}
