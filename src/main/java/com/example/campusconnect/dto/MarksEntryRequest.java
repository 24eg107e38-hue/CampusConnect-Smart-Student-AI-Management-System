package com.example.campusconnect.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class MarksEntryRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @Min(value = 0, message = "Internal marks must be >= 0")
    @Max(value = 20, message = "Internal marks cannot exceed 20")
    private Double internalMarks = 0.0;

    @Min(value = 0, message = "Assignment marks must be >= 0")
    @Max(value = 10, message = "Assignment marks cannot exceed 10")
    private Double assignmentMarks = 0.0;

    @Min(value = 0, message = "Mid exam marks must be >= 0")
    @Max(value = 30, message = "Mid exam marks cannot exceed 30")
    private Double midExamMarks = 0.0;

    @Min(value = 0, message = "Final exam marks must be >= 0")
    @Max(value = 40, message = "Final exam marks cannot exceed 40")
    private Double finalExamMarks = 0.0;

    public MarksEntryRequest() {}

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Double getInternalMarks() {
        return internalMarks;
    }

    public void setInternalMarks(Double internalMarks) {
        this.internalMarks = internalMarks;
    }

    public Double getAssignmentMarks() {
        return assignmentMarks;
    }

    public void setAssignmentMarks(Double assignmentMarks) {
        this.assignmentMarks = assignmentMarks;
    }

    public Double getMidExamMarks() {
        return midExamMarks;
    }

    public void setMidExamMarks(Double midExamMarks) {
        this.midExamMarks = midExamMarks;
    }

    public Double getFinalExamMarks() {
        return finalExamMarks;
    }

    public void setFinalExamMarks(Double finalExamMarks) {
        this.finalExamMarks = finalExamMarks;
    }
}
