package com.example.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class GoalDto {
    private Long id;
    private Long studentId;
    private String title;
    private String goalType;
    private Double targetValue;
    private Double currentValue;
    private String unit;
    private LocalDate targetDate;
    private String status; // IN_PROGRESS, ACHIEVED
    private double progressPercentage;

    public static class GoalRequest {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Goal type is required")
        private String goalType; // GPA, PERCENTAGE, ATTENDANCE, ASSIGNMENTS

        @NotNull(message = "Target value is required")
        private Double targetValue;

        private Double currentValue;
        private String unit;
        private LocalDate targetDate;

        public GoalRequest() {}

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

        public String getGoalType() {
            return goalType;
        }

        public void setGoalType(String goalType) {
            this.goalType = goalType;
        }

        public Double getTargetValue() {
            return targetValue;
        }

        public void setTargetValue(Double targetValue) {
            this.targetValue = targetValue;
        }

        public Double getCurrentValue() {
            return currentValue;
        }

        public void setCurrentValue(Double currentValue) {
            this.currentValue = currentValue;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public LocalDate getTargetDate() {
            return targetDate;
        }

        public void setTargetDate(LocalDate targetDate) {
            this.targetDate = targetDate;
        }
    }

    public GoalDto() {}

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getGoalType() {
        return goalType;
    }

    public void setGoalType(String goalType) {
        this.goalType = goalType;
    }

    public Double getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(Double targetValue) {
        this.targetValue = targetValue;
    }

    public Double getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Double currentValue) {
        this.currentValue = currentValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
