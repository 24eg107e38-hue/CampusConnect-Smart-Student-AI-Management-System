package com.example.campusconnect.dto;

import java.util.List;

public class PerformanceAnalysisDto {
    private Long studentId;
    private String studentName;
    private String studentRollNo;
    private String departmentName;
    private String course;
    private int year;

    // Core Metrics
    private double attendancePercentage;
    private double averageMarksPercentage;
    private double assignmentCompletionPercentage;
    private double gpa; // on a 10.0 scale
    private double overallPerformanceScore; // composite 0-100

    // Qualitative status: Excellent (>=85), Good (>=70), Average (>=55), Needs Improvement (<55)
    private String overallStatus;
    private String statusBadgeClass; // badge-success, badge-primary, badge-warning, badge-danger

    // Rule-based insights
    private List<String> recommendations;
    private List<String> strengths;
    private List<String> areasForImprovement;

    // Subject breakdown for visualization
    private List<SubjectScoreDto> subjectScores;

    public static class SubjectScoreDto {
        private String subjectCode;
        private String subjectName;
        private double marksPercentage;
        private double attendancePercentage;
        private String grade;

        public SubjectScoreDto() {}

        public SubjectScoreDto(String subjectCode, String subjectName, double marksPercentage, double attendancePercentage, String grade) {
            this.subjectCode = subjectCode;
            this.subjectName = subjectName;
            this.marksPercentage = marksPercentage;
            this.attendancePercentage = attendancePercentage;
            this.grade = grade;
        }

        public String getSubjectCode() {
            return subjectCode;
        }

        public void setSubjectCode(String subjectCode) {
            this.subjectCode = subjectCode;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public void setSubjectName(String subjectName) {
            this.subjectName = subjectName;
        }

        public double getMarksPercentage() {
            return marksPercentage;
        }

        public void setMarksPercentage(double marksPercentage) {
            this.marksPercentage = marksPercentage;
        }

        public double getAttendancePercentage() {
            return attendancePercentage;
        }

        public void setAttendancePercentage(double attendancePercentage) {
            this.attendancePercentage = attendancePercentage;
        }

        public String getGrade() {
            return grade;
        }

        public void setGrade(String grade) {
            this.grade = grade;
        }
    }

    public PerformanceAnalysisDto() {}

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

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public double getAverageMarksPercentage() {
        return averageMarksPercentage;
    }

    public void setAverageMarksPercentage(double averageMarksPercentage) {
        this.averageMarksPercentage = averageMarksPercentage;
    }

    public double getAssignmentCompletionPercentage() {
        return assignmentCompletionPercentage;
    }

    public void setAssignmentCompletionPercentage(double assignmentCompletionPercentage) {
        this.assignmentCompletionPercentage = assignmentCompletionPercentage;
    }

    public double getGpa() {
        return gpa;
    }

    public void setGpa(double gpa) {
        this.gpa = gpa;
    }

    public double getOverallPerformanceScore() {
        return overallPerformanceScore;
    }

    public void setOverallPerformanceScore(double overallPerformanceScore) {
        this.overallPerformanceScore = overallPerformanceScore;
    }

    public String getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }

    public String getStatusBadgeClass() {
        return statusBadgeClass;
    }

    public void setStatusBadgeClass(String statusBadgeClass) {
        this.statusBadgeClass = statusBadgeClass;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getAreasForImprovement() {
        return areasForImprovement;
    }

    public void setAreasForImprovement(List<String> areasForImprovement) {
        this.areasForImprovement = areasForImprovement;
    }

    public List<SubjectScoreDto> getSubjectScores() {
        return subjectScores;
    }

    public void setSubjectScores(List<SubjectScoreDto> subjectScores) {
        this.subjectScores = subjectScores;
    }
}
