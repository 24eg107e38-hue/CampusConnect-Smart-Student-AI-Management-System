package com.example.campusconnect.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    // Student Dashboard Stats
    public static class StudentDashboardStats {
        private String studentName;
        private String studentRollNo;
        private String departmentName;
        private String course;
        private int year;
        private double attendancePercentage;
        private double averageMarks;
        private double assignmentCompletionPercentage;
        private double currentGpa;
        private long pendingAssignmentsCount;
        private String latestLeaveStatus;
        private boolean attendanceAlert;
        private String alertMessage;
        private List<NoticeDto> recentNotices;
        private List<GoalDto> goals;
        private PerformanceAnalysisDto performance;

        public StudentDashboardStats() {}

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

        public double getAverageMarks() {
            return averageMarks;
        }

        public void setAverageMarks(double averageMarks) {
            this.averageMarks = averageMarks;
        }

        public double getAssignmentCompletionPercentage() {
            return assignmentCompletionPercentage;
        }

        public void setAssignmentCompletionPercentage(double assignmentCompletionPercentage) {
            this.assignmentCompletionPercentage = assignmentCompletionPercentage;
        }

        public double getCurrentGpa() {
            return currentGpa;
        }

        public void setCurrentGpa(double currentGpa) {
            this.currentGpa = currentGpa;
        }

        public long getPendingAssignmentsCount() {
            return pendingAssignmentsCount;
        }

        public void setPendingAssignmentsCount(long pendingAssignmentsCount) {
            this.pendingAssignmentsCount = pendingAssignmentsCount;
        }

        public String getLatestLeaveStatus() {
            return latestLeaveStatus;
        }

        public void setLatestLeaveStatus(String latestLeaveStatus) {
            this.latestLeaveStatus = latestLeaveStatus;
        }

        public boolean isAttendanceAlert() {
            return attendanceAlert;
        }

        public void setAttendanceAlert(boolean attendanceAlert) {
            this.attendanceAlert = attendanceAlert;
        }

        public String getAlertMessage() {
            return alertMessage;
        }

        public void setAlertMessage(String alertMessage) {
            this.alertMessage = alertMessage;
        }

        public List<NoticeDto> getRecentNotices() {
            return recentNotices;
        }

        public void setRecentNotices(List<NoticeDto> recentNotices) {
            this.recentNotices = recentNotices;
        }

        public List<GoalDto> getGoals() {
            return goals;
        }

        public void setGoals(List<GoalDto> goals) {
            this.goals = goals;
        }

        public PerformanceAnalysisDto getPerformance() {
            return performance;
        }

        public void setPerformance(PerformanceAnalysisDto performance) {
            this.performance = performance;
        }
    }

    // Faculty Dashboard Stats
    public static class FacultyDashboardStats {
        private String facultyName;
        private String facultyId;
        private String departmentName;
        private long totalStudents;
        private double averageAttendance;
        private long studentsBelow75Count;
        private double averageMarks;
        private long pendingAssignments;
        private long pendingLeaveRequests;
        private Map<String, Long> studentsByDepartment;
        private List<LeaveRequestDto> recentLeaveRequests;
        private List<NoticeDto> recentNotices;

        public FacultyDashboardStats() {}

        public String getFacultyName() {
            return facultyName;
        }

        public void setFacultyName(String facultyName) {
            this.facultyName = facultyName;
        }

        public String getFacultyId() {
            return facultyId;
        }

        public void setFacultyId(String facultyId) {
            this.facultyId = facultyId;
        }

        public String getDepartmentName() {
            return departmentName;
        }

        public void setDepartmentName(String departmentName) {
            this.departmentName = departmentName;
        }

        public long getTotalStudents() {
            return totalStudents;
        }

        public void setTotalStudents(long totalStudents) {
            this.totalStudents = totalStudents;
        }

        public double getAverageAttendance() {
            return averageAttendance;
        }

        public void setAverageAttendance(double averageAttendance) {
            this.averageAttendance = averageAttendance;
        }

        public long getStudentsBelow75Count() {
            return studentsBelow75Count;
        }

        public void setStudentsBelow75Count(long studentsBelow75Count) {
            this.studentsBelow75Count = studentsBelow75Count;
        }

        public double getAverageMarks() {
            return averageMarks;
        }

        public void setAverageMarks(double averageMarks) {
            this.averageMarks = averageMarks;
        }

        public long getPendingAssignments() {
            return pendingAssignments;
        }

        public void setPendingAssignments(long pendingAssignments) {
            this.pendingAssignments = pendingAssignments;
        }

        public long getPendingLeaveRequests() {
            return pendingLeaveRequests;
        }

        public void setPendingLeaveRequests(long pendingLeaveRequests) {
            this.pendingLeaveRequests = pendingLeaveRequests;
        }

        public Map<String, Long> getStudentsByDepartment() {
            return studentsByDepartment;
        }

        public void setStudentsByDepartment(Map<String, Long> studentsByDepartment) {
            this.studentsByDepartment = studentsByDepartment;
        }

        public List<LeaveRequestDto> getRecentLeaveRequests() {
            return recentLeaveRequests;
        }

        public void setRecentLeaveRequests(List<LeaveRequestDto> recentLeaveRequests) {
            this.recentLeaveRequests = recentLeaveRequests;
        }

        public List<NoticeDto> getRecentNotices() {
            return recentNotices;
        }

        public void setRecentNotices(List<NoticeDto> recentNotices) {
            this.recentNotices = recentNotices;
        }
    }

    // Admin Dashboard Stats
    public static class AdminDashboardStats {
        private long totalStudents;
        private long totalFaculty;
        private long totalDepartments;
        private long totalActiveUsers;
        private double averageAttendance;
        private double averageStudentPerformance;
        private long pendingLeaveRequests;
        private long pendingAchievements;
        private Map<String, Long> studentDistribution;
        private Map<String, Double> departmentAttendance;

        public AdminDashboardStats() {}

        public long getTotalStudents() {
            return totalStudents;
        }

        public void setTotalStudents(long totalStudents) {
            this.totalStudents = totalStudents;
        }

        public long getTotalFaculty() {
            return totalFaculty;
        }

        public void setTotalFaculty(long totalFaculty) {
            this.totalFaculty = totalFaculty;
        }

        public long getTotalDepartments() {
            return totalDepartments;
        }

        public void setTotalDepartments(long totalDepartments) {
            this.totalDepartments = totalDepartments;
        }

        public long getTotalActiveUsers() {
            return totalActiveUsers;
        }

        public void setTotalActiveUsers(long totalActiveUsers) {
            this.totalActiveUsers = totalActiveUsers;
        }

        public double getAverageAttendance() {
            return averageAttendance;
        }

        public void setAverageAttendance(double averageAttendance) {
            this.averageAttendance = averageAttendance;
        }

        public double getAverageStudentPerformance() {
            return averageStudentPerformance;
        }

        public void setAverageStudentPerformance(double averageStudentPerformance) {
            this.averageStudentPerformance = averageStudentPerformance;
        }

        public long getPendingLeaveRequests() {
            return pendingLeaveRequests;
        }

        public void setPendingLeaveRequests(long pendingLeaveRequests) {
            this.pendingLeaveRequests = pendingLeaveRequests;
        }

        public long getPendingAchievements() {
            return pendingAchievements;
        }

        public void setPendingAchievements(long pendingAchievements) {
            this.pendingAchievements = pendingAchievements;
        }

        public Map<String, Long> getStudentDistribution() {
            return studentDistribution;
        }

        public void setStudentDistribution(Map<String, Long> studentDistribution) {
            this.studentDistribution = studentDistribution;
        }

        public Map<String, Double> getDepartmentAttendance() {
            return departmentAttendance;
        }

        public void setDepartmentAttendance(Map<String, Double> departmentAttendance) {
            this.departmentAttendance = departmentAttendance;
        }
    }
}
