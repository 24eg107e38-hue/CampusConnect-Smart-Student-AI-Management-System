package com.example.campusconnect.service;

import com.example.campusconnect.dto.AchievementDto;
import com.example.campusconnect.entity.Achievement;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.AchievementRepository;
import com.example.campusconnect.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public AchievementDto createAchievement(AchievementDto.CreateRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        Achievement achievement = new Achievement();
        achievement.setStudent(student);
        achievement.setTitle(request.getTitle());
        achievement.setCategory(request.getCategory().toUpperCase());
        achievement.setDescription(request.getDescription());
        achievement.setAchievementDate(request.getAchievementDate());
        achievement.setProofUrl(request.getProofUrl());
        achievement.setVerified(false);

        Achievement saved = achievementRepository.save(achievement);
        return mapToDto(saved);
    }

    public List<AchievementDto> getAchievementsByStudent(Long studentId) {
        return achievementRepository.findByStudentIdOrderByAchievementDateDesc(studentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<AchievementDto> getAllAchievements() {
        return achievementRepository.findAllByOrderByAchievementDateDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public AchievementDto verifyAchievement(Long achievementId, AchievementDto.VerifyRequest request) {
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found with ID: " + achievementId));

        achievement.setVerified(request.isVerified());
        achievement.setVerifiedBy(request.getVerifiedBy() != null ? request.getVerifiedBy() : "Faculty / Admin");

        Achievement saved = achievementRepository.save(achievement);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteAchievement(Long achievementId) {
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found with ID: " + achievementId));
        achievementRepository.delete(achievement);
    }

    public AchievementDto mapToDto(Achievement a) {
        AchievementDto dto = new AchievementDto();
        dto.setId(a.getId());
        dto.setStudentId(a.getStudent().getId());
        dto.setStudentName(a.getStudent().getUser().getFullName());
        dto.setStudentRollNo(a.getStudent().getStudentId());
        dto.setDepartmentName(a.getStudent().getDepartment().getName());
        dto.setTitle(a.getTitle());
        dto.setCategory(a.getCategory());
        dto.setDescription(a.getDescription());
        dto.setAchievementDate(a.getAchievementDate());
        dto.setProofUrl(a.getProofUrl());
        dto.setVerified(a.isVerified());
        dto.setVerifiedBy(a.getVerifiedBy());
        return dto;
    }
}
