package com.example.campusconnect.controller;

import com.example.campusconnect.dto.*;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.repository.StudentRepository;
import com.example.campusconnect.service.AiService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/assistant/chat")
    public ResponseEntity<ApiResponse<AiChatDto.Response>> chatWithAssistant(
            @RequestBody AiChatDto.Request request,
            HttpServletRequest httpRequest) {
        
        // If studentId wasn't passed, resolve from authenticated session
        if (request.getStudentId() == null) {
            Long userId = (Long) httpRequest.getAttribute("currentUserId");
            if (userId != null) {
                studentRepository.findByUserId(userId).ifPresent(s -> request.setStudentId(s.getId()));
            }
        }

        AiChatDto.Response response = aiService.chatWithAssistant(request);
        return ResponseEntity.ok(ApiResponse.success("AI Assistant response generated", response));
    }

    @PostMapping("/study-plan")
    public ResponseEntity<ApiResponse<StudyPlanDto.Response>> generateStudyPlan(
            @RequestBody StudyPlanDto.Request request,
            HttpServletRequest httpRequest) {

        if (request.getStudentId() == null) {
            Long userId = (Long) httpRequest.getAttribute("currentUserId");
            if (userId != null) {
                studentRepository.findByUserId(userId).ifPresent(s -> request.setStudentId(s.getId()));
            }
        }

        StudyPlanDto.Response response = aiService.generateStudyPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Personalized AI study plan generated", response));
    }

    @GetMapping("/performance-explanation/student/{studentId}")
    public ResponseEntity<ApiResponse<PerformanceExplanationDto>> explainPerformance(
            @PathVariable Long studentId) {
        PerformanceExplanationDto explanation = aiService.explainPerformance(studentId);
        return ResponseEntity.ok(ApiResponse.success("AI performance explanation compiled", explanation));
    }

    @GetMapping("/performance-explanation/my")
    public ResponseEntity<ApiResponse<PerformanceExplanationDto>> explainMyPerformance(
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("currentUserId");
        Student student = null;
        if (userId != null) {
            student = studentRepository.findByUserId(userId).orElse(null);
        }
        Long studentId = student != null ? student.getId() : 1L;

        PerformanceExplanationDto explanation = aiService.explainPerformance(studentId);
        return ResponseEntity.ok(ApiResponse.success("AI performance explanation compiled", explanation));
    }
}
