package com.example.campusconnect.controller;

import com.example.campusconnect.dto.AchievementDto;
import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.service.AchievementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    @PostMapping
    public ResponseEntity<ApiResponse<AchievementDto>> createAchievement(
            @Valid @RequestBody AchievementDto.CreateRequest request) {
        AchievementDto achievement = achievementService.createAchievement(request);
        return ResponseEntity.ok(ApiResponse.success("Achievement recorded successfully", achievement));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AchievementDto>>> getAchievementsByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(achievementService.getAchievementsByStudent(studentId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AchievementDto>>> getAllAchievements() {
        return ResponseEntity.ok(ApiResponse.success(achievementService.getAllAchievements()));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<AchievementDto>> verifyAchievement(
            @PathVariable Long id,
            @RequestBody AchievementDto.VerifyRequest request) {
        AchievementDto verified = achievementService.verifyAchievement(id, request);
        return ResponseEntity.ok(ApiResponse.success("Achievement verification updated", verified));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAchievement(@PathVariable Long id) {
        achievementService.deleteAchievement(id);
        return ResponseEntity.ok(ApiResponse.success("Achievement removed successfully", null));
    }
}
