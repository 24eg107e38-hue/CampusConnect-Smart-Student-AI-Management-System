package com.example.campusconnect.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class StudyPlanDto {

    public static class Request {
        private Long studentId;
        private Double dailyHours;
        private String targetExam;
        private String focusGoal;

        public Request() {}

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public Double getDailyHours() {
            return dailyHours != null ? dailyHours : 3.0;
        }

        public void setDailyHours(Double dailyHours) {
            this.dailyHours = dailyHours;
        }

        public String getTargetExam() {
            return targetExam;
        }

        public void setTargetExam(String targetExam) {
            this.targetExam = targetExam;
        }

        public String getFocusGoal() {
            return focusGoal;
        }

        public void setFocusGoal(String focusGoal) {
            this.focusGoal = focusGoal;
        }
    }

    public static class Response {
        private Long studentId;
        private String studentName;
        private Double dailyHours;
        private String strategicSummary;
        private List<PrioritySubject> prioritySubjects;
        private Map<String, List<StudySession>> weeklySchedule;
        private List<String> strategicTips;
        private LocalDateTime generatedAt = LocalDateTime.now();

        public Response() {}

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

        public Double getDailyHours() {
            return dailyHours;
        }

        public void setDailyHours(Double dailyHours) {
            this.dailyHours = dailyHours;
        }

        public String getStrategicSummary() {
            return strategicSummary;
        }

        public void setStrategicSummary(String strategicSummary) {
            this.strategicSummary = strategicSummary;
        }

        public List<PrioritySubject> getPrioritySubjects() {
            return prioritySubjects;
        }

        public void setPrioritySubjects(List<PrioritySubject> prioritySubjects) {
            this.prioritySubjects = prioritySubjects;
        }

        public Map<String, List<StudySession>> getWeeklySchedule() {
            return weeklySchedule;
        }

        public void setWeeklySchedule(Map<String, List<StudySession>> weeklySchedule) {
            this.weeklySchedule = weeklySchedule;
        }

        public List<String> getStrategicTips() {
            return strategicTips;
        }

        public void setStrategicTips(List<String> strategicTips) {
            this.strategicTips = strategicTips;
        }

        public LocalDateTime getGeneratedAt() {
            return generatedAt;
        }

        public void setGeneratedAt(LocalDateTime generatedAt) {
            this.generatedAt = generatedAt;
        }
    }

    public static class PrioritySubject {
        private String subjectCode;
        private String subjectName;
        private double currentScore;
        private double attendanceRate;
        private double recommendedWeeklyHours;
        private String urgency; // "HIGH", "MEDIUM", "LOW"
        private String reason;

        public PrioritySubject() {}

        public PrioritySubject(String subjectCode, String subjectName, double currentScore, double attendanceRate, double recommendedWeeklyHours, String urgency, String reason) {
            this.subjectCode = subjectCode;
            this.subjectName = subjectName;
            this.currentScore = currentScore;
            this.attendanceRate = attendanceRate;
            this.recommendedWeeklyHours = recommendedWeeklyHours;
            this.urgency = urgency;
            this.reason = reason;
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

        public double getCurrentScore() {
            return currentScore;
        }

        public void setCurrentScore(double currentScore) {
            this.currentScore = currentScore;
        }

        public double getAttendanceRate() {
            return attendanceRate;
        }

        public void setAttendanceRate(double attendanceRate) {
            this.attendanceRate = attendanceRate;
        }

        public double getRecommendedWeeklyHours() {
            return recommendedWeeklyHours;
        }

        public void setRecommendedWeeklyHours(double recommendedWeeklyHours) {
            this.recommendedWeeklyHours = recommendedWeeklyHours;
        }

        public String getUrgency() {
            return urgency;
        }

        public void setUrgency(String urgency) {
            this.urgency = urgency;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public static class StudySession {
        private String timeSlot;
        private String subject;
        private String topic;
        private String technique; // "Pomodoro (50/10)", "Active Recall", "Problem Solving"

        public StudySession() {}

        public StudySession(String timeSlot, String subject, String topic, String technique) {
            this.timeSlot = timeSlot;
            this.subject = subject;
            this.topic = topic;
            this.technique = technique;
        }

        public String getTimeSlot() {
            return timeSlot;
        }

        public void setTimeSlot(String timeSlot) {
            this.timeSlot = timeSlot;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getTopic() {
            return topic;
        }

        public void setTopic(String topic) {
            this.topic = topic;
        }

        public String getTechnique() {
            return technique;
        }

        public void setTechnique(String technique) {
            this.technique = technique;
        }
    }
}
