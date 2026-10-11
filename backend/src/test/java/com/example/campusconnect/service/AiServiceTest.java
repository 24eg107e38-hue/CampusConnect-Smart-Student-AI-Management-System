package com.example.campusconnect.service;

import com.example.campusconnect.dto.*;
import com.example.campusconnect.entity.*;
import com.example.campusconnect.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiService Heuristics & Cognitive Engine Unit Tests")
public class AiServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AttendanceService attendanceService;

    @Mock
    private PerformanceService performanceService;

    @Mock
    private MarksRepository marksRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private AssignmentSubmissionRepository submissionRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private AiServiceImpl aiService;

    private Student student;
    private Department department;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setId(1L);
        department.setCode("CSE");
        department.setName("Computer Science");

        User user = new User();
        user.setId(10L);
        user.setFullName("Rahul Sharma");

        student = new Student();
        student.setId(1L);
        student.setUser(user);
        student.setDepartment(department);
        student.setYear(3);
    }

    @Test
    @DisplayName("Should generate contextual AI response for attendance inquiries with recovery alert")
    void shouldGenerateContextualAttendanceReply() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        AttendanceSummaryDto att = new AttendanceSummaryDto();
        att.setOverallPercentage(64.0);
        att.setBelowThreshold(true);
        att.setTotalWorkingDays(50);
        att.setPresentDays(32);
        att.setAbsentDays(18);
        when(attendanceService.getStudentAttendanceOverview(1L)).thenReturn(att);

        PerformanceAnalysisDto perf = new PerformanceAnalysisDto();
        perf.setGpa(7.4);
        perf.setOverallPerformanceScore(61.1);
        perf.setOverallStatus("Average");
        when(performanceService.analyzePerformance(1L)).thenReturn(perf);

        when(assignmentRepository.findByDepartmentIdAndYearOrderByDueDateDesc(1L, 3))
                .thenReturn(Collections.emptyList());

        AiChatDto.Request request = new AiChatDto.Request();
        request.setStudentId(1L);
        request.setMessage("Can you explain my attendance status?");

        AiChatDto.Response response = aiService.chatWithAssistant(request);

        assertNotNull(response);
        assertNotNull(response.getReply());
        assertTrue(response.getReply().contains("64.0%"));
        assertTrue(response.getReply().contains("CRITICAL ATTENDANCE ALERT"));
        assertFalse(response.getSuggestions().isEmpty());
    }

    @Test
    @DisplayName("Should generate personalized 7-day study plan with priority subjects and Pomodoro technique")
    void shouldGenerateStudyPlan() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        AttendanceSummaryDto att = new AttendanceSummaryDto();
        att.setOverallPercentage(85.0);
        att.setSubjectAttendance(Collections.emptyList());
        when(attendanceService.getStudentAttendanceOverview(1L)).thenReturn(att);

        Subject sub1 = new Subject();
        sub1.setId(101L);
        sub1.setCode("CS501");
        sub1.setName("Operating Systems");

        when(subjectRepository.findByDepartmentIdAndYear(1L, 3)).thenReturn(List.of(sub1));

        StudyPlanDto.Request request = new StudyPlanDto.Request();
        request.setStudentId(1L);
        request.setDailyHours(3.0);
        request.setFocusGoal("Raise GPA to 8.5");

        StudyPlanDto.Response plan = aiService.generateStudyPlan(request);

        assertNotNull(plan);
        assertEquals("Rahul Sharma", plan.getStudentName());
        assertEquals(3.0, plan.getDailyHours());
        assertFalse(plan.getPrioritySubjects().isEmpty());
        assertNotNull(plan.getWeeklySchedule());
        assertTrue(plan.getWeeklySchedule().containsKey("Monday"));
        assertTrue(plan.getWeeklySchedule().containsKey("Sunday"));
        assertFalse(plan.getStrategicTips().isEmpty());
    }

    @Test
    @DisplayName("Should generate 3-factor performance explanation with 30-day recovery roadmap")
    void shouldGeneratePerformanceExplanation() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        AttendanceSummaryDto att = new AttendanceSummaryDto();
        att.setOverallPercentage(78.0);
        att.setBelowThreshold(false);
        att.setTotalWorkingDays(40);
        att.setPresentDays(31);
        when(attendanceService.getStudentAttendanceOverview(1L)).thenReturn(att);

        PerformanceAnalysisDto perf = new PerformanceAnalysisDto();
        perf.setGpa(8.2);
        perf.setOverallPerformanceScore(83.0);
        perf.setOverallStatus("Good");
        perf.setAverageMarksPercentage(82.0);
        perf.setAssignmentCompletionPercentage(90.0);
        when(performanceService.analyzePerformance(1L)).thenReturn(perf);

        PerformanceExplanationDto explanation = aiService.explainPerformance(1L);

        assertNotNull(explanation);
        assertEquals(83.0, explanation.getOverallPerformanceScore());
        assertEquals("Good", explanation.getPerformanceTier());
        assertNotNull(explanation.getAttendanceFactor());
        assertNotNull(explanation.getMarksFactor());
        assertNotNull(explanation.getCourseworkFactor());
        assertNotNull(explanation.getStrategicActionPlan());
        assertFalse(explanation.getStrategicActionPlan().isEmpty());
        assertNotNull(explanation.getTrajectory());
    }
}
