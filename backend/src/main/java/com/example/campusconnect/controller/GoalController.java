package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.GoalDto;
import com.example.campusconnect.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @PostMapping
    public ResponseEntity<ApiResponse<GoalDto>> createGoal(
            @Valid @RequestBody GoalDto.GoalRequest request) {
        GoalDto goal = goalService.createGoal(request);
        return ResponseEntity.ok(ApiResponse.success("Academic goal created successfully", goal));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<GoalDto>>> getGoalsByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(goalService.getGoalsByStudent(studentId)));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<GoalDto>> updateProgress(
            @PathVariable Long id, @RequestBody Map<String, Double> payload) {
        Double currentValue = payload.get("currentValue");
        GoalDto updated = goalService.updateGoalProgress(id, currentValue);
        return ResponseEntity.ok(ApiResponse.success("Goal progress updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok(ApiResponse.success("Goal removed successfully", null));
    }
}
