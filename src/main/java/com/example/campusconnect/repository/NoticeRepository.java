package com.example.campusconnect.repository;

import com.example.campusconnect.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findAllByOrderByCreatedAtDesc();

    @Query("SELECT n FROM Notice n WHERE " +
           "(n.targetDepartment IS NULL OR n.targetDepartment.id = :deptId) AND " +
           "(n.targetYear IS NULL OR n.targetYear = 0 OR n.targetYear = :year) " +
           "ORDER BY n.createdAt DESC")
    List<Notice> findNoticesForStudent(@Param("deptId") Long deptId, @Param("year") Integer year);
}
