package com.campus.placement.repository;

import com.campus.placement.entity.Recruiter;
import com.campus.placement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {
    Optional<Recruiter> findByUser(User user);
    Optional<Recruiter> findByUserId(Long userId);
    Page<Recruiter> findAll(Pageable pageable);
}
