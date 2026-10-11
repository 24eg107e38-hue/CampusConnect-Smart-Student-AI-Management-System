package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.MarksDto;
import com.example.campusconnect.dto.MarksEntryRequest;
import com.example.campusconnect.service.MarksService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    @Autowired
    private MarksService marksService;

    @PostMapping
    public ResponseEntity<ApiResponse<MarksDto>> addOrUpdateMarks(
            @Valid @RequestBody MarksEntryRequest request) {
        MarksDto saved = marksService.addOrUpdateMarks(request);
        return ResponseEntity.ok(ApiResponse.success("Marks recorded successfully", saved));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<MarksDto>>> getMarksByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(marksService.getMarksByStudent(studentId)));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<MarksDto>>> getMarksBySubject(
            @PathVariable Long subjectId) {
        return ResponseEntity.ok(ApiResponse.success(marksService.getMarksBySubject(subjectId)));
    }
}
