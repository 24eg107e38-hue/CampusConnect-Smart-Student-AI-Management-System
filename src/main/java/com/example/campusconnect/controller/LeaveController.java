package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.LeaveRequestDto;
import com.example.campusconnect.service.LeaveService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestDto>> applyLeave(
            @Valid @RequestBody LeaveRequestDto.ApplyRequest request) {
        LeaveRequestDto leave = leaveService.applyLeave(request);
        return ResponseEntity.ok(ApiResponse.success("Leave request submitted successfully", leave));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getLeavesByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getLeavesByStudent(studentId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getAllLeaves(
            @RequestParam(required = false) Long departmentId) {
        if (departmentId != null) {
            return ResponseEntity.ok(ApiResponse.success(leaveService.getLeavesByDepartment(departmentId)));
        }
        return ResponseEntity.ok(ApiResponse.success(leaveService.getAllLeaves()));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getPendingLeaves() {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getPendingLeaves()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> updateLeaveStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeaveRequestDto.StatusUpdateRequest request,
            HttpServletRequest httpRequest) {
        Long facultyUserId = (Long) httpRequest.getAttribute("currentUserId");
        LeaveRequestDto updated = leaveService.updateLeaveStatus(id, request, facultyUserId);
        return ResponseEntity.ok(ApiResponse.success("Leave request status updated to " + request.getStatus(), updated));
    }
}
