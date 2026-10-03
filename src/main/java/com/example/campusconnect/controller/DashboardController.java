package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.DashboardStatsDto;
import com.example.campusconnect.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<DashboardStatsDto.StudentDashboardStats>> getStudentDashboard(
            @PathVariable Long studentId) {
        DashboardStatsDto.StudentDashboardStats stats = dashboardService.getStudentDashboard(studentId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<DashboardStatsDto.FacultyDashboardStats>> getFacultyDashboard(
            HttpServletRequest httpRequest) {
        Long facultyUserId = (Long) httpRequest.getAttribute("currentUserId");
        DashboardStatsDto.FacultyDashboardStats stats = dashboardService.getFacultyDashboard(facultyUserId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<DashboardStatsDto.AdminDashboardStats>> getAdminDashboard() {
        DashboardStatsDto.AdminDashboardStats stats = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
