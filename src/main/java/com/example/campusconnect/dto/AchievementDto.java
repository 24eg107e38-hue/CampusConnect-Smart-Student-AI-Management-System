package com.example.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AchievementDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentRollNo;
    private String departmentName;
    private String title;
    private String category;
    private String description;
    private LocalDate achievementDate;
    private String proofUrl;
    private boolean verified;
    private String verifiedBy;

    public static class CreateRequest {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Category is required")
        private String category;

        private String description;

        @NotNull(message = "Achievement date is required")
        private LocalDate achievementDate;

        private String proofUrl;

        public CreateRequest() {}

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDate getAchievementDate() {
            return achievementDate;
        }

        public void setAchievementDate(LocalDate achievementDate) {
            this.achievementDate = achievementDate;
        }

        public String getProofUrl() {
            return proofUrl;
        }

        public void setProofUrl(String proofUrl) {
            this.proofUrl = proofUrl;
        }
    }

    public static class VerifyRequest {
        private boolean verified = true;
        private String verifiedBy;

        public VerifyRequest() {}

        public boolean isVerified() {
            return verified;
        }

        public void setVerified(boolean verified) {
            this.verified = verified;
        }

        public String getVerifiedBy() {
            return verifiedBy;
        }

        public void setVerifiedBy(String verifiedBy) {
            this.verifiedBy = verifiedBy;
        }
    }

    public AchievementDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentRollNo() {
        return studentRollNo;
    }

    public void setStudentRollNo(String studentRollNo) {
        this.studentRollNo = studentRollNo;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getAchievementDate() {
        return achievementDate;
    }

    public void setAchievementDate(LocalDate achievementDate) {
        this.achievementDate = achievementDate;
    }

    public String getProofUrl() {
        return proofUrl;
    }

    public void setProofUrl(String proofUrl) {
        this.proofUrl = proofUrl;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }
}
