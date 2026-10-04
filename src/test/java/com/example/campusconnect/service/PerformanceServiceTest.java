package com.example.campusconnect.service;

import com.example.campusconnect.dto.PerformanceAnalysisDto;
import com.example.campusconnect.entity.*;
import com.example.campusconnect.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PerformanceService Unit Tests")
public class PerformanceServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private MarksRepository marksRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private AssignmentSubmissionRepository submissionRepository;

    @InjectMocks
    private PerformanceService performanceService;

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
        user.setFullName("Test Student");

        student = new Student();
        student.setId(1L);
        student.setUser(user);
        student.setDepartment(department);
        student.setYear(3);
    }

    @Test
    @DisplayName("Should correctly calculate weighted score (25% Att, 50% Marks, 25% Assignments)")
    void shouldCalculateWeightedCompositeScoreCorrectly() {
        // Attendance: 8 present out of 10 = 80.0%
        Subject sub = new Subject();
        sub.setId(1L);
        sub.setCode("CS501");
        sub.setName("Databases");

        Attendance a1 = new Attendance();
        a1.setStatus("PRESENT");
        a1.setSubject(sub);
        Attendance a2 = new Attendance();
        a2.setStatus("ABSENT");
        a2.setSubject(sub);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(attendanceRepository.findByStudentId(1L)).thenReturn(List.of(a1, a1, a1, a1, a2)); // 4/5 = 80%

        // Marks: 90%
        Marks m1 = new Marks();
        m1.setSubject(sub);
        m1.setPercentage(90.0);
        m1.setGrade("A+");
        when(marksRepository.findByStudentId(1L)).thenReturn(List.of(m1));

        // Assignments: 1 out of 1 submitted = 100%
        Assignment assign = new Assignment();
        assign.setId(10L);
        when(assignmentRepository.findByDepartmentIdAndYearOrderByDueDateDesc(1L, 3)).thenReturn(List.of(assign));
        when(submissionRepository.findByAssignmentIdAndStudentId(10L, 1L))
                .thenReturn(Optional.of(new AssignmentSubmission()));

        PerformanceAnalysisDto result = performanceService.analyzePerformance(1L);

        assertNotNull(result);
        assertEquals(80.0, result.getAttendancePercentage());
        assertEquals(90.0, result.getAverageMarksPercentage());
        assertEquals(100.0, result.getAssignmentCompletionPercentage());

        // Expected composite: 80*0.25 (20) + 90*0.5 (45) + 100*0.25 (25) = 90.0
        assertEquals(90.0, result.getOverallPerformanceScore());
        assertEquals("Excellent", result.getOverallStatus());
        assertEquals(9.0, result.getGpa());
    }

    @Test
    @DisplayName("Should identify At-Risk student with score below 55.0 and generate alerts")
    void shouldIdentifyAtRiskStudent() {
        Subject sub = new Subject();
        sub.setId(1L);
        sub.setCode("CS501");
        sub.setName("Databases");

        // Attendance: 2 out of 5 = 40%
        Attendance a1 = new Attendance();
        a1.setStatus("PRESENT");
        a1.setSubject(sub);
        Attendance a2 = new Attendance();
        a2.setStatus("ABSENT");
        a2.setSubject(sub);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(attendanceRepository.findByStudentId(1L)).thenReturn(List.of(a1, a1, a2, a2, a2)); // 40%

        // Marks: 45%
        Marks m1 = new Marks();
        m1.setSubject(sub);
        m1.setPercentage(45.0);
        m1.setGrade("F");
        when(marksRepository.findByStudentId(1L)).thenReturn(List.of(m1));

        // Assignments: 0 submitted out of 1 = 0%
        Assignment assign = new Assignment();
        assign.setId(10L);
        when(assignmentRepository.findByDepartmentIdAndYearOrderByDueDateDesc(1L, 3)).thenReturn(List.of(assign));
        when(submissionRepository.findByAssignmentIdAndStudentId(10L, 1L)).thenReturn(Optional.empty());

        PerformanceAnalysisDto result = performanceService.analyzePerformance(1L);

        // Expected composite: 40*0.25 (10) + 45*0.5 (22.5) + 0*0.25 (0) = 32.5
        assertEquals(32.5, result.getOverallPerformanceScore());
        assertEquals("Needs Improvement", result.getOverallStatus());
        assertFalse(result.getRecommendations().isEmpty());
        assertTrue(result.getRecommendations().stream().anyMatch(r -> r.contains("mandatory 75% threshold")));
    }
}
