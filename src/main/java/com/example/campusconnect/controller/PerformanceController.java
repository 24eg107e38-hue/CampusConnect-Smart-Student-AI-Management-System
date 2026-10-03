package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.PerformanceAnalysisDto;
import com.example.campusconnect.service.PerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<PerformanceAnalysisDto>> analyzeStudentPerformance(
            @PathVariable Long studentId) {
        PerformanceAnalysisDto analysis = performanceService.analyzePerformance(studentId);
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }
}
