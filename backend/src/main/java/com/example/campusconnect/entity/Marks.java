package com.example.campusconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "marks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "subject_id", "semester"})
})
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private int semester = 1;

    @Column(name = "internal_marks")
    private Double internalMarks = 0.0; // out of 20

    @Column(name = "assignment_marks")
    private Double assignmentMarks = 0.0; // out of 10

    @Column(name = "mid_exam_marks")
    private Double midExamMarks = 0.0; // out of 30

    @Column(name = "final_exam_marks")
    private Double finalExamMarks = 0.0; // out of 40

    @Column(name = "total_marks")
    private Double totalMarks = 0.0; // out of 100

    @Column(name = "percentage")
    private Double percentage = 0.0;

    @Column(length = 5)
    private String grade = "F";

    public Marks() {}

    public Marks(Student student, Subject subject, int semester, Double internalMarks, Double assignmentMarks, Double midExamMarks, Double finalExamMarks) {
        this.student = student;
        this.subject = subject;
        this.semester = semester;
        this.internalMarks = internalMarks != null ? internalMarks : 0.0;
        this.assignmentMarks = assignmentMarks != null ? assignmentMarks : 0.0;
        this.midExamMarks = midExamMarks != null ? midExamMarks : 0.0;
        this.finalExamMarks = finalExamMarks != null ? finalExamMarks : 0.0;
        calculateTotalAndGrade();
    }

    public void calculateTotalAndGrade() {
        double i = internalMarks != null ? internalMarks : 0.0;
        double a = assignmentMarks != null ? assignmentMarks : 0.0;
        double m = midExamMarks != null ? midExamMarks : 0.0;
        double f = finalExamMarks != null ? finalExamMarks : 0.0;
        this.totalMarks = Math.round((i + a + m + f) * 100.0) / 100.0;
        this.percentage = this.totalMarks; // since total max is 100

        if (this.totalMarks >= 90) {
            this.grade = "A+";
        } else if (this.totalMarks >= 80) {
            this.grade = "A";
        } else if (this.totalMarks >= 70) {
            this.grade = "B";
        } else if (this.totalMarks >= 60) {
            this.grade = "C";
        } else if (this.totalMarks >= 50) {
            this.grade = "D";
        } else if (this.totalMarks >= 40) {
            this.grade = "E";
        } else {
            this.grade = "F";
        }
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

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public Double getInternalMarks() {
        return internalMarks;
    }

    public void setInternalMarks(Double internalMarks) {
        this.internalMarks = internalMarks;
        calculateTotalAndGrade();
    }

    public Double getAssignmentMarks() {
        return assignmentMarks;
    }

    public void setAssignmentMarks(Double assignmentMarks) {
        this.assignmentMarks = assignmentMarks;
        calculateTotalAndGrade();
    }

    public Double getMidExamMarks() {
        return midExamMarks;
    }

    public void setMidExamMarks(Double midExamMarks) {
        this.midExamMarks = midExamMarks;
        calculateTotalAndGrade();
    }

    public Double getFinalExamMarks() {
        return finalExamMarks;
    }

    public void setFinalExamMarks(Double finalExamMarks) {
        this.finalExamMarks = finalExamMarks;
        calculateTotalAndGrade();
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }
}
