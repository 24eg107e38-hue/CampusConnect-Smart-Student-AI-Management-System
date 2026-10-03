package com.example.campusconnect.dto;

import java.util.List;

public class AttendanceSummaryDto {
    private Long studentId;
    private String studentName;
    private String studentRollNo;
    private String departmentName;
    private long totalWorkingDays;
    private long presentDays;
    private long absentDays;
    private double overallPercentage;
    private boolean belowThreshold; // true if < 75%
    private String alertMessage;
    private List<SubjectAttendanceDto> subjectAttendance;

    public static class SubjectAttendanceDto {
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private long totalClasses;
        private long presentClasses;
        private long absentClasses;
        private double percentage;
        private boolean belowThreshold;

        public SubjectAttendanceDto() {}

        public SubjectAttendanceDto(Long subjectId, String subjectCode, String subjectName, long totalClasses, long presentClasses, long absentClasses, double percentage, boolean belowThreshold) {
            this.subjectId = subjectId;
            this.subjectCode = subjectCode;
            this.subjectName = subjectName;
            this.totalClasses = totalClasses;
            this.presentClasses = presentClasses;
            this.absentClasses = absentClasses;
            this.percentage = percentage;
            this.belowThreshold = belowThreshold;
        }

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(Long subjectId) {
            this.subjectId = subjectId;
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

        public long getTotalClasses() {
            return totalClasses;
        }

        public void setTotalClasses(long totalClasses) {
            this.totalClasses = totalClasses;
        }

        public long getPresentClasses() {
            return presentClasses;
        }

        public void setPresentClasses(long presentClasses) {
            this.presentClasses = presentClasses;
        }

        public long getAbsentClasses() {
            return absentClasses;
        }

        public void setAbsentClasses(long absentClasses) {
            this.absentClasses = absentClasses;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }

        public boolean isBelowThreshold() {
            return belowThreshold;
        }

        public void setBelowThreshold(boolean belowThreshold) {
            this.belowThreshold = belowThreshold;
        }
    }

    public AttendanceSummaryDto() {}

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

    public long getTotalWorkingDays() {
        return totalWorkingDays;
    }

    public void setTotalWorkingDays(long totalWorkingDays) {
        this.totalWorkingDays = totalWorkingDays;
    }

    public long getPresentDays() {
        return presentDays;
    }

    public void setPresentDays(long presentDays) {
        this.presentDays = presentDays;
    }

    public long getAbsentDays() {
        return absentDays;
    }

    public void setAbsentDays(long absentDays) {
        this.absentDays = absentDays;
    }

    public double getOverallPercentage() {
        return overallPercentage;
    }

    public void setOverallPercentage(double overallPercentage) {
        this.overallPercentage = overallPercentage;
    }

    public boolean isBelowThreshold() {
        return belowThreshold;
    }

    public void setBelowThreshold(boolean belowThreshold) {
        this.belowThreshold = belowThreshold;
    }

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }

    public List<SubjectAttendanceDto> getSubjectAttendance() {
        return subjectAttendance;
    }

    public void setSubjectAttendance(List<SubjectAttendanceDto> subjectAttendance) {
        this.subjectAttendance = subjectAttendance;
    }
}
