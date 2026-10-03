package com.example.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class NoticeDto {
    private Long id;
    private String title;
    private String content;
    private Long targetDepartmentId;
    private String targetDepartmentName;
    private Integer targetYear;
    private String priority; // NORMAL, IMPORTANT, URGENT
    private String postedBy;
    private LocalDateTime createdAt;

    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Content is required")
        private String content;

        private Long targetDepartmentId; // optional (null means all)
        private Integer targetYear;      // optional (null/0 means all)
        private String priority = "NORMAL";
        private String postedBy;

        public CreateRequest() {}

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Long getTargetDepartmentId() {
            return targetDepartmentId;
        }

        public void setTargetDepartmentId(Long targetDepartmentId) {
            this.targetDepartmentId = targetDepartmentId;
        }

        public Integer getTargetYear() {
            return targetYear;
        }

        public void setTargetYear(Integer targetYear) {
            this.targetYear = targetYear;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }

        public String getPostedBy() {
            return postedBy;
        }

        public void setPostedBy(String postedBy) {
            this.postedBy = postedBy;
        }
    }

    public NoticeDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getTargetDepartmentId() {
        return targetDepartmentId;
    }

    public void setTargetDepartmentId(Long targetDepartmentId) {
        this.targetDepartmentId = targetDepartmentId;
    }

    public String getTargetDepartmentName() {
        return targetDepartmentName;
    }

    public void setTargetDepartmentName(String targetDepartmentName) {
        this.targetDepartmentName = targetDepartmentName;
    }

    public Integer getTargetYear() {
        return targetYear;
    }

    public void setTargetYear(Integer targetYear) {
        this.targetYear = targetYear;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(String postedBy) {
        this.postedBy = postedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
