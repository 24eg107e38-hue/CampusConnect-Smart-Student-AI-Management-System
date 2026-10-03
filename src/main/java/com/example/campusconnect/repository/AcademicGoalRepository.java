package com.example.campusconnect.repository;

import com.example.campusconnect.entity.AcademicGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicGoalRepository extends JpaRepository<AcademicGoal, Long> {
    List<AcademicGoal> findByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, String status);
}
