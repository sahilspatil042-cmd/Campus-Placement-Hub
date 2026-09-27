package com.campus.placement.repository;

import com.campus.placement.entity.Application;
import com.campus.placement.entity.PlacementDrive;
import com.campus.placement.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(Student student);
    Optional<Application> findByStudentAndDrive(Student student, PlacementDrive drive);
    boolean existsByStudentAndDrive(Student student, PlacementDrive drive);

    Page<Application> findByDrive(PlacementDrive drive, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.drive = :drive AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Application> findByDriveFiltered(
        @Param("drive") PlacementDrive drive,
        @Param("status") Application.ApplicationStatus status,
        Pageable pageable
    );

    long countByStatus(Application.ApplicationStatus status);
    long countByDrive(PlacementDrive drive);

    @Query("SELECT COUNT(DISTINCT a.student) FROM Application a WHERE a.status = 'SELECTED'")
    long countSelectedStudents();

    @Query("SELECT a.drive.company.name, COUNT(a) FROM Application a WHERE a.status = 'SELECTED' GROUP BY a.drive.company.name ORDER BY COUNT(a) DESC")
    List<Object[]> countSelectedByCompany();

    @Query("SELECT TO_CHAR(a.appliedAt, 'YYYY-MM'), COUNT(a) FROM Application a GROUP BY TO_CHAR(a.appliedAt, 'YYYY-MM') ORDER BY TO_CHAR(a.appliedAt, 'YYYY-MM')")
    List<Object[]> countByMonth();

    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countByStatus();
}
