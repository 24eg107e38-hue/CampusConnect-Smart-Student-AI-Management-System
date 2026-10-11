package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.entity.Subject;
import com.example.campusconnect.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Integer year) {
        if (departmentId != null && year != null) {
            return ResponseEntity.ok(ApiResponse.success(subjectService.getSubjectsByDepartmentAndYear(departmentId, year)));
        } else if (departmentId != null) {
            return ResponseEntity.ok(ApiResponse.success(subjectService.getSubjectsByDepartment(departmentId)));
        }
        return ResponseEntity.ok(ApiResponse.success(subjectService.getAllSubjects()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Subject>> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getSubjectById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Subject>> createSubject(@RequestBody Map<String, Object> body) {
        Subject subject = new Subject();
        subject.setCode((String) body.get("code"));
        subject.setName((String) body.get("name"));
        subject.setYear(((Number) body.get("year")).intValue());
        subject.setSemester(((Number) body.get("semester")).intValue());
        subject.setCredits(((Number) body.getOrDefault("credits", 3)).intValue());

        Long departmentId = ((Number) body.get("departmentId")).longValue();
        Subject created = subjectService.createSubject(subject, departmentId);
        return ResponseEntity.ok(ApiResponse.success("Subject created successfully", created));
    }
}
