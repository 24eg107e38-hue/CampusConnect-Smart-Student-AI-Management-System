package com.example.campusconnect.repository;

import com.example.campusconnect.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<Attendance> findBySubjectIdAndAttendanceDate(Long subjectId, LocalDate attendanceDate);
    Optional<Attendance> findByStudentIdAndSubjectIdAndAttendanceDate(Long studentId, Long subjectId, LocalDate attendanceDate);

    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, String status);

    long countByStudentIdAndSubjectId(Long studentId, Long subjectId);
    long countByStudentIdAndSubjectIdAndStatus(Long studentId, Long subjectId, String status);

    List<Attendance> findByStudentDepartmentId(Long departmentId);
}
