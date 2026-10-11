package com.example.campusconnect.repository;

import com.example.campusconnect.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByStudentIdOrderByAchievementDateDesc(Long studentId);
    List<Achievement> findAllByOrderByAchievementDateDesc();
    long countByStudentId(Long studentId);
    long countByVerified(boolean verified);
}
