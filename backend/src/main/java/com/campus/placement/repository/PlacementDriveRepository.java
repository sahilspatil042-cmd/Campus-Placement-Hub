package com.campus.placement.repository;

import com.campus.placement.entity.PlacementDrive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {
    @Query("SELECT d FROM PlacementDrive d JOIN d.company c WHERE " +
           "(:search IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:companyId IS NULL OR c.id = :companyId)")
    Page<PlacementDrive> findAllFiltered(
        @Param("search") String search,
        @Param("status") PlacementDrive.DriveStatus status,
        @Param("companyId") Long companyId,
        Pageable pageable
    );

    long countByStatus(PlacementDrive.DriveStatus status);
}
