package com.example.campusconnect.controller;

import com.example.campusconnect.dto.ApiResponse;
import com.example.campusconnect.dto.NoticeDto;
import com.example.campusconnect.service.NoticeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @PostMapping
    public ResponseEntity<ApiResponse<NoticeDto>> createNotice(
            @Valid @RequestBody NoticeDto.CreateRequest request) {
        NoticeDto notice = noticeService.createNotice(request);
        return ResponseEntity.ok(ApiResponse.success("Notice published successfully", notice));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticeDto>>> getAllNotices() {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getAllNotices()));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<NoticeDto>>> getNoticesForStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getNoticesForStudent(studentId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok(ApiResponse.success("Notice removed successfully", null));
    }
}
