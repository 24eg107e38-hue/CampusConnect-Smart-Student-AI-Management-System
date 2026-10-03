package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.StudentDto;
import com.example.campusconnect.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentDto>>> searchStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) Double minAttendance,
            @RequestParam(required = false) Double maxAttendance,
            @RequestParam(required = false) String performanceStatus) {

        List<StudentDto> students = studentService.searchStudents(
                search, deptId, year, course, minAttendance, maxAttendance, performanceStatus
        );
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<StudentDto>> getStudentByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentByUserId(userId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudent(
            @PathVariable Long id, @RequestBody StudentDto dto) {
        StudentDto updated = studentService.updateStudentProfile(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student removed successfully", null));
    }
}
