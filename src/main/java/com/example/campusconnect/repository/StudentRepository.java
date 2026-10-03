package com.example.campusconnect.repository;

import com.example.campusconnect.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByStudentId(String studentId);
    boolean existsByStudentId(String studentId);
    List<Student> findByDepartmentId(Long departmentId);
    List<Student> findByDepartmentIdAndYear(Long departmentId, int year);

    @Query("SELECT s FROM Student s WHERE " +
           "(:deptId IS NULL OR s.department.id = :deptId) AND " +
           "(:year IS NULL OR s.year = :year) AND " +
           "(:course IS NULL OR LOWER(s.course) LIKE LOWER(CONCAT('%', :course, '%'))) AND " +
           "(:search IS NULL OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.user.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Student> searchStudents(@Param("search") String search,
                                 @Param("deptId") Long deptId,
                                 @Param("year") Integer year,
                                 @Param("course") String course);
}
