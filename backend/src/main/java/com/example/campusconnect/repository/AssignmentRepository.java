package com.example.campusconnect.repository;

import com.example.campusconnect.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByDepartmentIdAndYearOrderByDueDateDesc(Long departmentId, int year);
    List<Assignment> findByCreatedByFacultyIdOrderByDueDateDesc(Long facultyId);
    List<Assignment> findAllByOrderByDueDateDesc();
}
