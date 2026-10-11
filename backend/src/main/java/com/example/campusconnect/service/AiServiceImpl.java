package com.example.campusconnect.service;

import com.example.campusconnect.dto.*;
import com.example.campusconnect.entity.*;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiServiceImpl implements AiService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Value("${campusconnect.ai.api-key:}")
    private String aiApiKey;

    @Value("${campusconnect.ai.provider:local}")
    private String aiProvider;

    // =========================================================================
    // 1. AI Student Assistant
    // =========================================================================
    @Override
    public AiChatDto.Response chatWithAssistant(AiChatDto.Request request) {
        Long studentId = request.getStudentId() != null ? request.getStudentId() : 1L;
        Student student = studentRepository.findById(studentId).orElse(null);

        String studentName = student != null ? student.getUser().getFullName() : "Student";
        String studentDept = student != null ? student.getDepartment().getName() : "General";
        int studentYear = student != null ? student.getYear() : 1;

        // Fetch live context
        AttendanceSummaryDto att = attendanceService.getStudentAttendanceOverview(studentId);
        PerformanceAnalysisDto perf = performanceService.analyzePerformance(studentId);

        List<Assignment> pendingAssignments = assignmentRepository.findByDepartmentIdAndYearOrderByDueDateDesc(
                student != null ? student.getDepartment().getId() : 1L, studentYear
        );

        String contextSummary = String.format("%s (%s, Yr %d) | Att: %.1f%% | GPA: %.1f/10.0 | Tier: %s",
                studentName, student != null ? student.getDepartment().getCode() : "DEPT",
                studentYear, att.getOverallPercentage(), perf.getGpa(), perf.getOverallStatus());

        String userMsg = request.getMessage() != null ? request.getMessage().trim().toLowerCase() : "";

        // Formulate Intelligent Cognitive Response
        StringBuilder reply = new StringBuilder();
        List<String> suggestions = new ArrayList<>();

        if (userMsg.contains("attendance") || userMsg.contains("absent") || userMsg.contains("classes")) {
            reply.append(String.format("Hello %s! Here is your current attendance analysis:\n\n", studentName));
            reply.append(String.format("• **Overall Attendance:** %.1f%%\n", att.getOverallPercentage()));
            reply.append(String.format("• **Total Sessions Held:** %d | **Attended:** %d | **Missed:** %d\n\n",
                    att.getTotalWorkingDays(), att.getPresentDays(), att.getAbsentDays()));

            if (att.isBelowThreshold()) {
                long needed = Math.max(1, (long) Math.ceil((0.75 * att.getTotalWorkingDays() - att.getPresentDays()) / 0.25));
                reply.append(String.format("⚠️ **CRITICAL ATTENDANCE ALERT:** Your attendance is below the mandatory 75%% university requirement. " +
                        "You must attend at least the next **%d consecutive sessions** without absence to restore your standing above 75%% and remain eligible for end-semester exams.", needed));
            } else {
                reply.append("✅ **Good Standing:** Your attendance satisfies the university requirement (>75%). Maintain this pace to secure your internal marks.");
            }

            suggestions.add("Generate my personalized study plan");
            suggestions.add("How does this affect my overall performance score?");
            suggestions.add("Show my subject-wise attendance");

        } else if (userMsg.contains("performance") || userMsg.contains("score") || userMsg.contains("gpa") || userMsg.contains("grade")) {
            reply.append(String.format("📊 **AI Academic Performance Overview for %s:**\n\n", studentName));
            reply.append(String.format("• **Composite Performance Score:** %.1f / 100 (%s)\n",
                    perf.getOverallPerformanceScore(), perf.getOverallStatus()));
            reply.append(String.format("• **Cumulative GPA:** %.1f / 10.0\n", perf.getGpa()));
            reply.append(String.format("• **Average Marks:** %.1f%%\n", perf.getAverageMarksPercentage()));
            reply.append(String.format("• **Assignment Completion:** %.1f%%\n\n", perf.getAssignmentCompletionPercentage()));

            reply.append("**Key Strengths Identified:**\n");
            if (perf.getStrengths() != null && !perf.getStrengths().isEmpty()) {
                for (String s : perf.getStrengths()) {
                    reply.append("  ✓ ").append(s).append("\n");
                }
            } else {
                reply.append("  ✓ Steady progress across core coursework.\n");
            }

            reply.append("\n**Recommended Priority Focus:**\n");
            if (perf.getRecommendations() != null && !perf.getRecommendations().isEmpty()) {
                for (String r : perf.getRecommendations()) {
                    reply.append("  💡 ").append(r).append("\n");
                }
            }

            suggestions.add("Explain the mathematical breakdown of my score");
            suggestions.add("Create an AI study schedule to boost my GPA");
            suggestions.add("What assignments are due soon?");

        } else if (userMsg.contains("assignment") || userMsg.contains("homework") || userMsg.contains("deadline") || userMsg.contains("due")) {
            reply.append(String.format("📑 **Upcoming Coursework & Deadlines for %s:**\n\n", studentDept));

            if (pendingAssignments.isEmpty()) {
                reply.append("Great job! You have no pending assignments at this moment.\n");
            } else {
                int count = 0;
                for (Assignment a : pendingAssignments) {
                    if (count++ >= 4) break;
                    long days = ChronoUnit.DAYS.between(LocalDate.now(), a.getDueDate());
                    String status = days < 0 ? "⚠️ OVERDUE" : (days == 0 ? "🔥 DUE TODAY" : String.format("⏰ Due in %d days", days));
                    reply.append(String.format("• **%s** (%s) - %s (Due: %s)\n",
                            a.getTitle(), a.getSubject().getCode(), status, a.getDueDate()));
                }
                reply.append("\n💡 *Pro-Tip: Submitting coursework at least 24 hours prior to deadline boosts internal grading and eliminates late-submission penalties.*");
            }

            suggestions.add("Help me outline my database assignment");
            suggestions.add("Show my recent marks");
            suggestions.add("Generate weekly study plan");

        } else if (userMsg.contains("study plan") || userMsg.contains("schedule") || userMsg.contains("routine") || userMsg.contains("timetable")) {
            reply.append("📅 I can build an optimized, AI-generated weekly study plan tailored to your weak subjects and upcoming exam syllabus! " +
                    "Head over to the **AI Study Plan** tab or click below to generate an intelligent schedule allocating optimal focus blocks based on your credit weights.");

            suggestions.add("Generate my personalized study plan");
            suggestions.add("How should I prepare for CS501 DBMS?");
            suggestions.add("What is the Pomodoro technique?");

        } else {
            // General Conversational AI Assistant
            reply.append(String.format("Hello %s! I am your **CampusConnect AI Academic Assistant** 🤖.\n\n", studentName));
            reply.append("I have real-time visibility into your curriculum, current attendance records, examination marks, and upcoming deadlines. Here are a few ways I can assist you right now:\n\n");
            reply.append("1. 📈 **Analyze your current GPA & composite score**\n");
            reply.append("2. 🚨 **Review attendance thresholds & calculate makeup lectures**\n");
            reply.append("3. 🎯 **Synthesize a personalized 7-day revision schedule**\n");
            reply.append("4. 📝 **Summarize upcoming assignment deadlines and grading criteria**\n");
            reply.append("5. 💡 **Provide targeted study strategies for your department's subjects**\n\n");
            reply.append("What would you like to explore today?");

            suggestions.add("Analyze my academic standing");
            suggestions.add("Check my attendance status");
            suggestions.add("Generate an AI study schedule");
            suggestions.add("View upcoming assignment deadlines");
        }

        return new AiChatDto.Response(reply.toString(), suggestions, contextSummary);
    }

    // =========================================================================
    // 2. AI Study Plan Generator
    // =========================================================================
    @Override
    public StudyPlanDto.Response generateStudyPlan(StudyPlanDto.Request request) {
        Long studentId = request.getStudentId() != null ? request.getStudentId() : 1L;
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        double dailyHours = request.getDailyHours() != null ? request.getDailyHours() : 3.0;

        // Fetch subjects & attendance
        AttendanceSummaryDto att = attendanceService.getStudentAttendanceOverview(studentId);
        List<Marks> marks = marksRepository.findByStudentId(studentId);
        List<Subject> subjects = subjectRepository.findByDepartmentIdAndYear(
                student.getDepartment().getId(), student.getYear()
        );

        Map<Long, Double> subjectMarksMap = new HashMap<>();
        for (Marks m : marks) {
            subjectMarksMap.put(m.getSubject().getId(), m.getPercentage() != null ? m.getPercentage() : 0.0);
        }

        Map<Long, Double> subjectAttMap = new HashMap<>();
        if (att != null && att.getSubjectAttendance() != null) {
            for (AttendanceSummaryDto.SubjectAttendanceDto s : att.getSubjectAttendance()) {
                subjectAttMap.put(s.getSubjectId(), s.getPercentage());
            }
        }

        // Compute Priority Subjects
        List<StudyPlanDto.PrioritySubject> priorityList = new ArrayList<>();
        double totalUrgencyWeights = 0;

        for (Subject sub : subjects) {
            double score = subjectMarksMap.getOrDefault(sub.getId(), 70.0);
            double attRate = subjectAttMap.getOrDefault(sub.getId(), 80.0);

            // Lower marks or lower attendance = higher priority
            double urgencyWeight = (100.0 - score) * 0.6 + (100.0 - attRate) * 0.4;
            totalUrgencyWeights += Math.max(urgencyWeight, 10.0);

            String urgency = urgencyWeight > 35 ? "HIGH" : (urgencyWeight > 20 ? "MEDIUM" : "LOW");
            String reason = score < 65
                    ? "Low mid-term scores require immediate conceptual review and problem sets."
                    : (attRate < 75 ? "Sub-75% attendance indicates missed classroom lectures requiring self-study." : "Good baseline; focus on advanced problem solving.");

            priorityList.add(new StudyPlanDto.PrioritySubject(
                    sub.getCode(), sub.getName(), score, attRate, 0.0, urgency, reason
            ));
        }

        // Allocate hours proportionally
        double weeklyTotalHours = dailyHours * 7.0;
        for (StudyPlanDto.PrioritySubject p : priorityList) {
            double score = p.getCurrentScore();
            double attRate = p.getAttendanceRate();
            double weight = Math.max((100.0 - score) * 0.6 + (100.0 - attRate) * 0.4, 10.0);
            double allocated = Math.round((weight / (totalUrgencyWeights > 0 ? totalUrgencyWeights : 1.0)) * weeklyTotalHours * 10.0) / 10.0;
            p.setRecommendedWeeklyHours(Math.max(allocated, 2.0));
        }

        // Sort priority list high to low
        priorityList.sort((a, b) -> Double.compare(b.getRecommendedWeeklyHours(), a.getRecommendedWeeklyHours()));

        // Generate Structured 7-Day Schedule
        Map<String, List<StudyPlanDto.StudySession>> weeklySchedule = new LinkedHashMap<>();
        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};

        int subIdx = 0;
        for (String day : days) {
            List<StudyPlanDto.StudySession> daySessions = new ArrayList<>();
            StudyPlanDto.PrioritySubject p1 = !priorityList.isEmpty() ? priorityList.get(subIdx % priorityList.size()) : null;
            StudyPlanDto.PrioritySubject p2 = priorityList.size() > 1 ? priorityList.get((subIdx + 1) % priorityList.size()) : p1;

            if ("Saturday".equals(day) || "Sunday".equals(day)) {
                daySessions.add(new StudyPlanDto.StudySession("10:00 AM - 12:00 PM",
                        p1 != null ? p1.getSubjectCode() : "Revision",
                        "End-of-Week Mastery & Mock Practice Exam", "Simulated Timed Assessment"));
                daySessions.add(new StudyPlanDto.StudySession("04:00 PM - 05:30 PM",
                        p2 != null ? p2.getSubjectCode() : "Review",
                        "Assignment Drafting & Coding Practice", "Hands-on Implementation"));
            } else {
                daySessions.add(new StudyPlanDto.StudySession("05:30 PM - 07:00 PM",
                        p1 != null ? p1.getSubjectCode() : "Core Subject",
                        "Core Lecture Review & Flashcard Recall", "Active Recall"));
                daySessions.add(new StudyPlanDto.StudySession("08:30 PM - 10:00 PM",
                        p2 != null ? p2.getSubjectCode() : "Applied Subject",
                        "Problem Solving & Numerical Exercises", "Pomodoro (50m Focus / 10m Rest)"));
            }

            weeklySchedule.put(day, daySessions);
            subIdx++;
        }

        List<String> tips = Arrays.asList(
                "Apply the 50/10 Pomodoro cadence: 50 minutes deep focus, 10 minutes screen-free cognitive recovery.",
                "Prioritize subjects marked 'HIGH' urgency during your highest energy time blocks (typically morning or early evening).",
                "Self-test using active recall rather than passive re-reading to build long-term conceptual retention.",
                "Sync upcoming assignment deadlines with your weekend implementation sessions."
        );

        String summary = String.format("Personalized %.1f-hour daily study protocol designed for %s (%s). Allocates %.1f total weekly study hours across %d departmental subjects with highest emphasis on %s.",
                dailyHours, student.getUser().getFullName(), student.getDepartment().getCode(),
                weeklyTotalHours, subjects.size(), !priorityList.isEmpty() ? priorityList.get(0).getSubjectCode() : "Core Courses");

        StudyPlanDto.Response response = new StudyPlanDto.Response();
        response.setStudentId(studentId);
        response.setStudentName(student.getUser().getFullName());
        response.setDailyHours(dailyHours);
        response.setStrategicSummary(summary);
        response.setPrioritySubjects(priorityList);
        response.setWeeklySchedule(weeklySchedule);
        response.setStrategicTips(tips);

        return response;
    }

    // =========================================================================
    // 3. AI Performance Explanation
    // =========================================================================
    @Override
    public PerformanceExplanationDto explainPerformance(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        AttendanceSummaryDto att = attendanceService.getStudentAttendanceOverview(studentId);
        PerformanceAnalysisDto perf = performanceService.analyzePerformance(studentId);

        double attPct = att.getOverallPercentage();
        double marksPct = perf.getAverageMarksPercentage();
        double assignPct = perf.getAssignmentCompletionPercentage();

        double attContribution = Math.round(attPct * 0.25 * 10.0) / 10.0;
        double marksContribution = Math.round(marksPct * 0.50 * 10.0) / 10.0;
        double assignContribution = Math.round(assignPct * 0.25 * 10.0) / 10.0;
        double compositeScore = Math.round((attContribution + marksContribution + assignContribution) * 10.0) / 10.0;

        PerformanceExplanationDto.FactorDetail fAtt = new PerformanceExplanationDto.FactorDetail(
                "Classroom Attendance", 25.0, attPct, attContribution,
                attPct >= 75
                        ? String.format("Strong attendance (%.1f%%) contributes %.1f / 25.0 max points and secures exam eligibility.", attPct, attContribution)
                        : String.format("Attendance (%.1f%%) is below the 75%% threshold, forfeiting %.1f potential points and triggering mandatory academic alerts.", attPct, (25.0 - attContribution))
        );

        PerformanceExplanationDto.FactorDetail fMarks = new PerformanceExplanationDto.FactorDetail(
                "Examination Marks", 50.0, marksPct, marksContribution,
                String.format("Exam performance (%.1f%%) carries 50%% systemic weight, yielding %.1f / 50.0 points. Exam grades represent the primary baseline of your GPA.", marksPct, marksContribution)
        );

        PerformanceExplanationDto.FactorDetail fAssign = new PerformanceExplanationDto.FactorDetail(
                "Coursework & Assignments", 25.0, assignPct, assignContribution,
                String.format("Assignment completion rate (%.1f%%) contributes %.1f / 25.0 points towards continuous assessment.", assignPct, assignContribution)
        );

        String executiveSummary = String.format(
                "Student %s maintains a composite score of %.1f/100, placing them in the '%s' academic standing tier. " +
                "The primary performance driver is examination marks (%.1f points), while %s.",
                student.getUser().getFullName(), compositeScore, perf.getOverallStatus(), marksContribution,
                attPct < 75 ? "attendance absenteeism represents the most severe drag on overall standing" : "consistent attendance supports baseline coursework stability"
        );

        List<String> drivers = new ArrayList<>();
        if (marksPct >= 75) drivers.add("Strong mastery demonstrated across core examinations.");
        if (attPct >= 85) drivers.add("Exemplary classroom presence ensuring continuous curriculum alignment.");
        if (assignPct >= 80) drivers.add("Diligent submission of continuous evaluation coursework.");
        if (drivers.isEmpty()) drivers.add("Foundational subject engagement with significant headroom for acceleration.");

        List<String> risks = new ArrayList<>();
        if (attPct < 75) risks.add(String.format("Attendance at %.1f%% risks statutory debarment from semester final examinations.", attPct));
        if (marksPct < 60) risks.add("Internal exam scores below 60% will depress final degree CGPA classification.");
        if (assignPct < 70) risks.add("Unsubmitted assignments result in automatic zeroes in internal grading.");
        if (risks.isEmpty()) risks.add("Complacency risk: Maintain current diligence to preserve honor roll eligibility.");

        List<PerformanceExplanationDto.ActionStep> plan = Arrays.asList(
                new PerformanceExplanationDto.ActionStep(1, "Days 1 - 7", "Eliminate any further lecture absences; achieve 100% presence in upcoming classes", "+3.5 points in attendance weight"),
                new PerformanceExplanationDto.ActionStep(2, "Days 8 - 14", "Complete all overdue and upcoming lab/homework assignments", "+4.0 points in continuous evaluation"),
                new PerformanceExplanationDto.ActionStep(3, "Days 15 - 21", "Execute 2-hour daily Pomodoro sessions focused on lowest-scoring subjects", "+6.0 points in upcoming midterm marks"),
                new PerformanceExplanationDto.ActionStep(4, "Days 22 - 30", "Attend faculty mentoring office hours and submit draft projects early", "+2.5 points in faculty continuous assessment")
        );

        double potentialUpside = Math.round((Math.min(100.0, compositeScore + 14.5) - compositeScore) * 10.0) / 10.0;
        PerformanceExplanationDto.TrajectoryProjection traj = new PerformanceExplanationDto.TrajectoryProjection(
                String.format("If habits remain unchanged, expected semester CGPA will plateau around %.1f / 10.0.", perf.getGpa()),
                String.format("Implementing the 4-step AI action plan will elevate the composite score to ~%.1f (Tier: %s).",
                        compositeScore + potentialUpside, compositeScore + potentialUpside >= 75 ? "Good / Excellent" : "Average"),
                potentialUpside
        );

        PerformanceExplanationDto dto = new PerformanceExplanationDto();
        dto.setStudentId(studentId);
        dto.setStudentName(student.getUser().getFullName());
        dto.setStudentRollNo(student.getStudentId());
        dto.setOverallPerformanceScore(compositeScore);
        dto.setPerformanceTier(perf.getOverallStatus());
        dto.setExecutiveSummary(executiveSummary);
        dto.setAttendanceFactor(fAtt);
        dto.setMarksFactor(fMarks);
        dto.setCourseworkFactor(fAssign);
        dto.setPrimaryDrivers(drivers);
        dto.setHiddenRisks(risks);
        dto.setStrategicActionPlan(plan);
        dto.setTrajectory(traj);

        return dto;
    }
}
