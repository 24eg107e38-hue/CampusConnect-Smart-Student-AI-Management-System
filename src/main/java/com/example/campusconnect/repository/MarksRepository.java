package com.example.campusconnect.repository;

import com.example.campusconnect.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentId(Long studentId);
    List<Marks> findByStudentIdAndSemester(Long studentId, int semester);
    Optional<Marks> findByStudentIdAndSubjectIdAndSemester(Long studentId, Long subjectId, int semester);
    List<Marks> findBySubjectId(Long subjectId);
    List<Marks> findByStudentDepartmentId(Long departmentId);
}
