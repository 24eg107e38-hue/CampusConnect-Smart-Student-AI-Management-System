package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.entity.User;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(
                "User account " + (saved.isActive() ? "activated" : "deactivated"), saved
        ));
    }
}
