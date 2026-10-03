package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.AttendanceMarkRequest;
import com.example.campusconnect.dto.AttendanceRecordDto;
import com.example.campusconnect.dto.AttendanceSummaryDto;
import com.example.campusconnect.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> markAttendance(
            @RequestBody AttendanceMarkRequest request) {
        List<AttendanceRecordDto> saved = attendanceService.markAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance recorded successfully", saved));
    }

    @GetMapping({"/student/{studentId}", "/student/{studentId}/overview"})
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getStudentAttendance(
            @PathVariable Long studentId) {
        AttendanceSummaryDto summary = attendanceService.getStudentAttendanceOverview(studentId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/student/{studentId}/subject-wise")
    public ResponseEntity<ApiResponse<List<AttendanceSummaryDto.SubjectAttendanceDto>>> getStudentSubjectWiseAttendance(
            @PathVariable Long studentId) {
        AttendanceSummaryDto summary = attendanceService.getStudentAttendanceOverview(studentId);
        return ResponseEntity.ok(ApiResponse.success(summary.getSubjectAttendance()));
    }

    @GetMapping("/student/{studentId}/records")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getStudentAttendanceRecords(
            @PathVariable Long studentId) {
        List<AttendanceRecordDto> records = attendanceService.getAttendanceByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getSubjectAttendance(
            @PathVariable Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<AttendanceRecordDto> records = attendanceService.getAttendanceForSubjectAndDate(subjectId, targetDate);
        return ResponseEntity.ok(ApiResponse.success(records));
    }
}
