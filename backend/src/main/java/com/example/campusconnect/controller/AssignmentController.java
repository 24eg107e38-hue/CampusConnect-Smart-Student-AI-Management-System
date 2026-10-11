package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.AssignmentCreateRequest;
import com.example.campusconnect.dto.AssignmentDto;
import com.example.campusconnect.dto.AssignmentSubmissionDto;
import com.example.campusconnect.service.AssignmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentDto>> createAssignment(
            @Valid @RequestBody AssignmentCreateRequest request,
            HttpServletRequest httpRequest) {
        Long facultyUserId = (Long) httpRequest.getAttribute("currentUserId");
        AssignmentDto created = assignmentService.createAssignment(request, facultyUserId);
        return ResponseEntity.ok(ApiResponse.success("Assignment created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAllAssignments(
            @RequestParam(required = false) Long facultyUserId) {
        if (facultyUserId != null) {
            return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentsByFaculty(facultyUserId)));
        }
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAllAssignments()));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsForStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentsForStudent(studentId)));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<AssignmentSubmissionDto>> submitAssignment(
            @Valid @RequestBody AssignmentSubmissionDto.SubmitRequest request) {
        AssignmentSubmissionDto submission = assignmentService.submitAssignment(request);
        return ResponseEntity.ok(ApiResponse.success("Assignment submitted successfully!", submission));
    }

    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<ApiResponse<List<AssignmentSubmissionDto>>> getSubmissions(
            @PathVariable Long assignmentId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSubmissionsForAssignment(assignmentId)));
    }

    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<AssignmentSubmissionDto>> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody AssignmentSubmissionDto.GradeRequest request) {
        AssignmentSubmissionDto graded = assignmentService.gradeSubmission(submissionId, request);
        return ResponseEntity.ok(ApiResponse.success("Submission graded successfully", graded));
    }
}
