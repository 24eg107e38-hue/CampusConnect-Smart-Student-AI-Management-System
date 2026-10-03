package com.example.campusconnect.repository;

import com.example.campusconnect.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByDepartmentId(Long departmentId);
    List<Subject> findByDepartmentIdAndYear(Long departmentId, int year);
    List<Subject> findByDepartmentIdAndSemester(Long departmentId, int semester);
    Optional<Subject> findByCode(String code);
}
