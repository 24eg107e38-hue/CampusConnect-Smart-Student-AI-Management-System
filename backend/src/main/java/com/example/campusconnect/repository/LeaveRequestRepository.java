package com.example.campusconnect.repository;

import com.example.campusconnect.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentIdOrderByAppliedAtDesc(Long studentId);
    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(String status);
    List<LeaveRequest> findAllByOrderByAppliedAtDesc();
    long countByStatus(String status);
    List<LeaveRequest> findByStudentDepartmentIdOrderByAppliedAtDesc(Long departmentId);
}
