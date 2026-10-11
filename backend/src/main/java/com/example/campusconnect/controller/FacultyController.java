package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.FacultyDto;
import com.example.campusconnect.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacultyDto>>> getAllFaculty() {
        return ResponseEntity.ok(ApiResponse.success(facultyService.getAllFaculty()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyDto>> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(facultyService.getFacultyById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<FacultyDto>> getFacultyByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(facultyService.getFacultyByUserId(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FacultyDto>> createFaculty(@RequestBody Map<String, Object> body) {
        FacultyDto dto = new FacultyDto();
        dto.setFacultyId((String) body.get("facultyId"));
        dto.setFullName((String) body.get("fullName"));
        dto.setEmail((String) body.get("email"));
        dto.setPhoneNumber((String) body.get("phoneNumber"));
        if (body.get("departmentId") != null) {
            dto.setDepartmentId(((Number) body.get("departmentId")).longValue());
        }
        dto.setDesignation((String) body.get("designation"));
        dto.setQualification((String) body.get("qualification"));
        dto.setSpecialization((String) body.get("specialization"));

        String rawPassword = (String) body.get("password");
        FacultyDto created = facultyService.createFaculty(dto, rawPassword);
        return ResponseEntity.ok(ApiResponse.success("Faculty member created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyDto>> updateFaculty(
            @PathVariable Long id, @RequestBody FacultyDto dto) {
        FacultyDto updated = facultyService.updateFaculty(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Faculty details updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty member removed successfully", null));
    }
}
