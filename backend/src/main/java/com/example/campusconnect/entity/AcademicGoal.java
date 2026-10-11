package com.example.campusconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "academic_goals")
public class AcademicGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank
    @Column(name = "goal_type", nullable = false, length = 50)
    private String goalType; // GPA, PERCENTAGE, ATTENDANCE, ASSIGNMENTS

    @Column(name = "target_value", nullable = false)
    private Double targetValue;

    @Column(name = "current_value")
    private Double currentValue = 0.0;

    @Column(name = "unit", length = 10)
    private String unit; // %, GPA, Count

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(nullable = false, length = 20)
    private String status = "IN_PROGRESS"; // IN_PROGRESS, ACHIEVED

    public AcademicGoal() {}

    public AcademicGoal(Student student, String title, String goalType, Double targetValue, Double currentValue, String unit, LocalDate targetDate) {
        this.student = student;
        this.title = title;
        this.goalType = goalType;
        this.targetValue = targetValue;
        this.currentValue = currentValue != null ? currentValue : 0.0;
        this.unit = unit;
        this.targetDate = targetDate;
        this.status = (this.currentValue >= this.targetValue) ? "ACHIEVED" : "IN_PROGRESS";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
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
        if (this.targetValue != null && this.currentValue != null && this.currentValue >= this.targetValue) {
            this.status = "ACHIEVED";
        }
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
}
