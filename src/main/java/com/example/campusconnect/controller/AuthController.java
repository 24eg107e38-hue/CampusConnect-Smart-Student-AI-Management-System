package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.LoginRequest;
import com.example.campusconnect.dto.LoginResponse;
import com.example.campusconnect.dto.RegisterRequest;
import com.example.campusconnect.entity.Department;
import com.example.campusconnect.service.AuthService;
import com.example.campusconnect.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private DepartmentService departmentService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful! Welcome to CampusConnect.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartmentsForRegistration() {
        return ResponseEntity.ok(ApiResponse.success(departmentService.getAllDepartments()));
    }
}
