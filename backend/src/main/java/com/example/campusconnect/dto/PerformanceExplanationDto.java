package com.example.campusconnect.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PerformanceExplanationDto {

    private Long studentId;
    private String studentName;
    private String studentRollNo;
    private double overallPerformanceScore;
    private String performanceTier;
    private String executiveSummary;
    private FactorDetail attendanceFactor;
    private FactorDetail marksFactor;
    private FactorDetail courseworkFactor;
    private List<String> primaryDrivers;
    private List<String> hiddenRisks;
    private List<ActionStep> strategicActionPlan;
    private TrajectoryProjection trajectory;
    private LocalDateTime generatedAt = LocalDateTime.now();

    public static class FactorDetail {
        private String factorName;
        private double weightPercentage;
        private double achievedScore;
        private double contributionPoints;
        private String diagnostic;

        public FactorDetail() {}

        public FactorDetail(String factorName, double weightPercentage, double achievedScore, double contributionPoints, String diagnostic) {
            this.factorName = factorName;
            this.weightPercentage = weightPercentage;
            this.achievedScore = achievedScore;
            this.contributionPoints = contributionPoints;
            this.diagnostic = diagnostic;
        }

        public String getFactorName() {
            return factorName;
        }

        public void setFactorName(String factorName) {
            this.factorName = factorName;
        }

        public double getWeightPercentage() {
            return weightPercentage;
        }

        public void setWeightPercentage(double weightPercentage) {
            this.weightPercentage = weightPercentage;
        }

        public double getAchievedScore() {
            return achievedScore;
        }

        public void setAchievedScore(double achievedScore) {
            this.achievedScore = achievedScore;
        }

        public double getContributionPoints() {
            return contributionPoints;
        }

        public void setContributionPoints(double contributionPoints) {
            this.contributionPoints = contributionPoints;
        }

        public String getDiagnostic() {
            return diagnostic;
        }

        public void setDiagnostic(String diagnostic) {
            this.diagnostic = diagnostic;
        }
    }

    public static class ActionStep {
        private int stepNumber;
        private String timeframe;
        private String action;
        private String expectedGain;

        public ActionStep() {}

        public ActionStep(int stepNumber, String timeframe, String action, String expectedGain) {
            this.stepNumber = stepNumber;
            this.timeframe = timeframe;
            this.action = action;
            this.expectedGain = expectedGain;
        }

        public int getStepNumber() {
            return stepNumber;
        }

        public void setStepNumber(int stepNumber) {
            this.stepNumber = stepNumber;
        }

        public String getTimeframe() {
            return timeframe;
        }

        public void setTimeframe(String timeframe) {
            this.timeframe = timeframe;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public String getExpectedGain() {
            return expectedGain;
        }

        public void setExpectedGain(String expectedGain) {
            this.expectedGain = expectedGain;
        }
    }

    public static class TrajectoryProjection {
        private String baselineProjection;
        private String optimizedProjection;
        private double potentialScoreUpside;

        public TrajectoryProjection() {}

        public TrajectoryProjection(String baselineProjection, String optimizedProjection, double potentialScoreUpside) {
            this.baselineProjection = baselineProjection;
            this.optimizedProjection = optimizedProjection;
            this.potentialScoreUpside = potentialScoreUpside;
        }

        public String getBaselineProjection() {
            return baselineProjection;
        }

        public void setBaselineProjection(String baselineProjection) {
            this.baselineProjection = baselineProjection;
        }

        public String getOptimizedProjection() {
            return optimizedProjection;
        }

        public void setOptimizedProjection(String optimizedProjection) {
            this.optimizedProjection = optimizedProjection;
        }

        public double getPotentialScoreUpside() {
            return potentialScoreUpside;
        }

        public void setPotentialScoreUpside(double potentialScoreUpside) {
            this.potentialScoreUpside = potentialScoreUpside;
        }
    }

    public PerformanceExplanationDto() {}

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

    public double getOverallPerformanceScore() {
        return overallPerformanceScore;
    }

    public void setOverallPerformanceScore(double overallPerformanceScore) {
        this.overallPerformanceScore = overallPerformanceScore;
    }

    public String getPerformanceTier() {
        return performanceTier;
    }

    public void setPerformanceTier(String performanceTier) {
        this.performanceTier = performanceTier;
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public FactorDetail getAttendanceFactor() {
        return attendanceFactor;
    }

    public void setAttendanceFactor(FactorDetail attendanceFactor) {
        this.attendanceFactor = attendanceFactor;
    }

    public FactorDetail getMarksFactor() {
        return marksFactor;
    }

    public void setMarksFactor(FactorDetail marksFactor) {
        this.marksFactor = marksFactor;
    }

    public FactorDetail getCourseworkFactor() {
        return courseworkFactor;
    }

    public void setCourseworkFactor(FactorDetail courseworkFactor) {
        this.courseworkFactor = courseworkFactor;
    }

    public List<String> getPrimaryDrivers() {
        return primaryDrivers;
    }

    public void setPrimaryDrivers(List<String> primaryDrivers) {
        this.primaryDrivers = primaryDrivers;
    }

    public List<String> getHiddenRisks() {
        return hiddenRisks;
    }

    public void setHiddenRisks(List<String> hiddenRisks) {
        this.hiddenRisks = hiddenRisks;
    }

    public List<ActionStep> getStrategicActionPlan() {
        return strategicActionPlan;
    }

    public void setStrategicActionPlan(List<ActionStep> strategicActionPlan) {
        this.strategicActionPlan = strategicActionPlan;
    }

    public TrajectoryProjection getTrajectory() {
        return trajectory;
    }

    public void setTrajectory(TrajectoryProjection trajectory) {
        this.trajectory = trajectory;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
