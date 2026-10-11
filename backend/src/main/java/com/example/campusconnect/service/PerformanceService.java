package com.example.campusconnect.service;

import com.example.campusconnect.dto.PerformanceAnalysisDto;
import com.example.campusconnect.entity.*;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PerformanceService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    public PerformanceAnalysisDto analyzePerformance(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        // 1. Attendance calculation
        List<Attendance> attendanceRecords = attendanceRepository.findByStudentId(studentId);
        long totalAttendanceClasses = attendanceRecords.size();
        long presentAttendanceClasses = attendanceRecords.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();

        double attendancePercentage = totalAttendanceClasses > 0
                ? Math.round(((double) presentAttendanceClasses / totalAttendanceClasses) * 1000.0) / 10.0
                : 100.0;

        // 2. Marks calculation
        List<Marks> marksList = marksRepository.findByStudentId(studentId);
        double totalMarksSum = 0;
        List<String> lowMarksSubjects = new ArrayList<>();
        List<String> strongSubjects = new ArrayList<>();
        List<PerformanceAnalysisDto.SubjectScoreDto> subjectScores = new ArrayList<>();

        if (!marksList.isEmpty()) {
            for (Marks m : marksList) {
                double pct = m.getPercentage() != null ? m.getPercentage() : 0.0;
                totalMarksSum += pct;

                // calculate subject attendance
                long subTotal = attendanceRecords.stream().filter(a -> a.getSubject().getId().equals(m.getSubject().getId())).count();
                long subPres = attendanceRecords.stream().filter(a -> a.getSubject().getId().equals(m.getSubject().getId()) && "PRESENT".equalsIgnoreCase(a.getStatus())).count();
                double subAttPct = subTotal > 0 ? Math.round(((double) subPres / subTotal) * 1000.0) / 10.0 : 100.0;

                subjectScores.add(new PerformanceAnalysisDto.SubjectScoreDto(
                        m.getSubject().getCode(),
                        m.getSubject().getName(),
                        pct,
                        subAttPct,
                        m.getGrade()
                ));

                if (pct < 50.0) {
                    lowMarksSubjects.add(m.getSubject().getName() + " (" + pct + "%)");
                } else if (pct >= 80.0) {
                    strongSubjects.add(m.getSubject().getName() + " (" + pct + "%)");
                }
            }
        }

        double averageMarksPercentage = !marksList.isEmpty()
                ? Math.round((totalMarksSum / marksList.size()) * 10.0) / 10.0
                : 75.0; // neutral default if none entered yet

        double gpa = Math.round((averageMarksPercentage / 10.0) * 100.0) / 100.0;

        // 3. Assignment performance calculation
        List<Assignment> deptAssignments = assignmentRepository.findByDepartmentIdAndYearOrderByDueDateDesc(
                student.getDepartment().getId(), student.getYear()
        );
        long totalAssignments = deptAssignments.size();
        long submittedCount = 0;
        for (Assignment a : deptAssignments) {
            Optional<AssignmentSubmission> sub = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), student.getId());
            if (sub.isPresent()) {
                submittedCount++;
            }
        }

        double assignmentCompletionPercentage = totalAssignments > 0
                ? Math.round(((double) submittedCount / totalAssignments) * 1000.0) / 10.0
                : 100.0;

        // 4. Overall Performance Score (Weighted composite: 25% attendance, 50% marks, 25% assignments)
        double overallPerformanceScore = Math.round(
                (attendancePercentage * 0.25 + averageMarksPercentage * 0.50 + assignmentCompletionPercentage * 0.25) * 10.0
        ) / 10.0;

        // 5. Overall Status & Badge
        String overallStatus;
        String statusBadgeClass;
        if (overallPerformanceScore >= 85.0) {
            overallStatus = "Excellent";
            statusBadgeClass = "badge-success";
        } else if (overallPerformanceScore >= 70.0) {
            overallStatus = "Good";
            statusBadgeClass = "badge-primary";
        } else if (overallPerformanceScore >= 55.0) {
            overallStatus = "Average";
            statusBadgeClass = "badge-warning";
        } else {
            overallStatus = "Needs Improvement";
            statusBadgeClass = "badge-danger";
        }

        // 6. Rule-based recommendations
        List<String> recommendations = new ArrayList<>();
        List<String> strengths = new ArrayList<>();
        List<String> areasForImprovement = new ArrayList<>();

        if (attendancePercentage < 75.0) {
            recommendations.add("Improve attendance immediately. Current attendance (" + attendancePercentage + "%) is below the mandatory 75% threshold.");
            areasForImprovement.add("Class attendance consistency (< 75%)");
        } else {
            strengths.add("Healthy attendance record (" + attendancePercentage + "%) meeting college criteria.");
        }

        if (assignmentCompletionPercentage < 80.0) {
            recommendations.add("Complete and submit pending assignments (" + (totalAssignments - submittedCount) + " remaining) to boost continuous assessment score.");
            areasForImprovement.add("Pending coursework and assignment submissions.");
        } else {
            strengths.add("Strong commitment to coursework deadlines (" + assignmentCompletionPercentage + "% completed).");
        }

        if (!lowMarksSubjects.isEmpty()) {
            recommendations.add("Focus revision on subjects with lower marks: " + String.join(", ", lowMarksSubjects) + ".");
            areasForImprovement.add("Academic reinforcement needed in " + String.join(", ", lowMarksSubjects));
        }

        if (!strongSubjects.isEmpty()) {
            strengths.add("Outstanding performance in " + String.join(", ", strongSubjects));
        }

        if (overallPerformanceScore >= 85.0) {
            recommendations.add("Maintain consistent study performance and consider applying for honors, certifications, and campus competitions.");
        } else if (recommendations.isEmpty()) {
            recommendations.add("Maintain consistent study performance and prepare ahead for upcoming end-semester examinations.");
        }

        PerformanceAnalysisDto dto = new PerformanceAnalysisDto();
        dto.setStudentId(student.getId());
        dto.setStudentName(student.getUser().getFullName());
        dto.setStudentRollNo(student.getStudentId());
        dto.setDepartmentName(student.getDepartment().getName());
        dto.setCourse(student.getCourse());
        dto.setYear(student.getYear());
        dto.setAttendancePercentage(attendancePercentage);
        dto.setAverageMarksPercentage(averageMarksPercentage);
        dto.setAssignmentCompletionPercentage(assignmentCompletionPercentage);
        dto.setGpa(gpa);
        dto.setOverallPerformanceScore(overallPerformanceScore);
        dto.setOverallStatus(overallStatus);
        dto.setStatusBadgeClass(statusBadgeClass);
        dto.setRecommendations(recommendations);
        dto.setStrengths(strengths);
        dto.setAreasForImprovement(areasForImprovement);
        dto.setSubjectScores(subjectScores);

        return dto;
    }
}
