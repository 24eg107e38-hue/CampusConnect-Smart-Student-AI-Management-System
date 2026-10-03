package com.example.campusconnect.service;

import com.example.campusconnect.dto.AttendanceSummaryDto;
import com.example.campusconnect.dto.DashboardStatsDto;
import com.example.campusconnect.dto.PerformanceAnalysisDto;
import com.example.campusconnect.entity.*;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private LeaveRequestRepository leaveRepository;

    @Autowired
    private AcademicGoalRepository goalRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private LeaveService leaveService;

    public DashboardStatsDto.StudentDashboardStats getStudentDashboard(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        AttendanceSummaryDto attSummary = attendanceService.getStudentAttendanceOverview(studentId);
        PerformanceAnalysisDto perf = performanceService.analyzePerformance(studentId);

        // Pending assignments
        List<Assignment> assignments = assignmentRepository.findByDepartmentIdAndYearOrderByDueDateDesc(
                student.getDepartment().getId(), student.getYear()
        );
        long pendingAssignmentsCount = 0;
        for (Assignment a : assignments) {
            Optional<AssignmentSubmission> sub = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), student.getId());
            if (sub.isEmpty()) {
                pendingAssignmentsCount++;
            }
        }

        // Latest leave status
        List<LeaveRequest> leaves = leaveRepository.findByStudentIdOrderByAppliedAtDesc(studentId);
        String latestLeaveStatus = leaves.isEmpty() ? "No Applications" : leaves.get(0).getStatus();

        DashboardStatsDto.StudentDashboardStats stats = new DashboardStatsDto.StudentDashboardStats();
        stats.setStudentName(student.getUser().getFullName());
        stats.setStudentRollNo(student.getStudentId());
        stats.setDepartmentName(student.getDepartment().getName());
        stats.setCourse(student.getCourse());
        stats.setYear(student.getYear());
        stats.setAttendancePercentage(attSummary.getOverallPercentage());
        stats.setAverageMarks(perf.getAverageMarksPercentage());
        stats.setAssignmentCompletionPercentage(perf.getAssignmentCompletionPercentage());
        stats.setCurrentGpa(perf.getGpa());
        stats.setPendingAssignmentsCount(pendingAssignmentsCount);
        stats.setLatestLeaveStatus(latestLeaveStatus);
        stats.setAttendanceAlert(attSummary.isBelowThreshold());
        stats.setAlertMessage(attSummary.getAlertMessage());
        stats.setRecentNotices(noticeService.getNoticesForStudent(studentId));
        stats.setGoals(goalService.getGoalsByStudent(studentId));
        stats.setPerformance(perf);

        return stats;
    }

    public DashboardStatsDto.FacultyDashboardStats getFacultyDashboard(Long facultyUserId) {
        Faculty faculty = facultyRepository.findByUserId(facultyUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found for user ID: " + facultyUserId));

        List<Student> allStudents = studentRepository.findAll();
        long totalStudents = allStudents.size();

        // Calculate attendance stats across students
        long below75Count = 0;
        double totalAttSum = 0;
        for (Student s : allStudents) {
            AttendanceSummaryDto sAtt = attendanceService.getStudentAttendanceOverview(s.getId());
            totalAttSum += sAtt.getOverallPercentage();
            if (sAtt.isBelowThreshold()) {
                below75Count++;
            }
        }
        double avgAttendance = totalStudents > 0 ? Math.round((totalAttSum / totalStudents) * 10.0) / 10.0 : 100.0;

        // Average marks
        List<Marks> allMarks = marksRepository.findAll();
        double avgMarks = 0;
        if (!allMarks.isEmpty()) {
            double marksSum = allMarks.stream().mapToDouble(m -> m.getPercentage() != null ? m.getPercentage() : 0.0).sum();
            avgMarks = Math.round((marksSum / allMarks.size()) * 10.0) / 10.0;
        }

        // Pending assignments created by this faculty
        List<Assignment> facultyAssignments = assignmentRepository.findByCreatedByFacultyIdOrderByDueDateDesc(faculty.getId());
        long pendingAssignmentsCount = facultyAssignments.size();

        // Pending leave requests in department
        List<LeaveRequest> pendingLeaves = leaveRepository.findByStatusOrderByAppliedAtDesc("PENDING");

        // Department wise student distribution
        Map<String, Long> studentsByDept = allStudents.stream()
                .collect(Collectors.groupingBy(s -> s.getDepartment() != null ? s.getDepartment().getName() : "Unassigned", Collectors.counting()));

        DashboardStatsDto.FacultyDashboardStats stats = new DashboardStatsDto.FacultyDashboardStats();
        stats.setFacultyName(faculty.getUser().getFullName());
        stats.setFacultyId(faculty.getFacultyId());
        stats.setDepartmentName(faculty.getDepartment().getName());
        stats.setTotalStudents(totalStudents);
        stats.setAverageAttendance(avgAttendance);
        stats.setStudentsBelow75Count(below75Count);
        stats.setAverageMarks(avgMarks);
        stats.setPendingAssignments(pendingAssignmentsCount);
        stats.setPendingLeaveRequests(pendingLeaves.size());
        stats.setStudentsByDepartment(studentsByDept);
        stats.setRecentLeaveRequests(pendingLeaves.stream().limit(5).map(leaveService::mapToDto).collect(Collectors.toList()));
        stats.setRecentNotices(noticeService.getAllNotices().stream().limit(5).collect(Collectors.toList()));

        return stats;
    }

    public DashboardStatsDto.AdminDashboardStats getAdminDashboard() {
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalActiveUsers = userRepository.countByActive(true);

        List<Student> allStudents = studentRepository.findAll();
        double totalAttSum = 0;
        double totalPerfSum = 0;
        for (Student s : allStudents) {
            AttendanceSummaryDto sAtt = attendanceService.getStudentAttendanceOverview(s.getId());
            totalAttSum += sAtt.getOverallPercentage();

            PerformanceAnalysisDto sPerf = performanceService.analyzePerformance(s.getId());
            totalPerfSum += sPerf.getOverallPerformanceScore();
        }

        double avgAttendance = allStudents.size() > 0
                ? Math.round((totalAttSum / allStudents.size()) * 10.0) / 10.0 : 0.0;
        double avgPerformance = allStudents.size() > 0
                ? Math.round((totalPerfSum / allStudents.size()) * 10.0) / 10.0 : 0.0;

        long pendingLeaves = leaveRepository.countByStatus("PENDING");
        long pendingAchievements = achievementRepository.countByVerified(false);

        Map<String, Long> studentDist = allStudents.stream()
                .collect(Collectors.groupingBy(s -> s.getDepartment() != null ? s.getDepartment().getCode() : "Other", Collectors.counting()));

        // Department attendance map
        Map<String, Double> deptAtt = new HashMap<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department d : departments) {
            List<Student> deptStudents = studentRepository.findByDepartmentId(d.getId());
            if (!deptStudents.isEmpty()) {
                double deptSum = 0;
                for (Student s : deptStudents) {
                    deptSum += attendanceService.getStudentAttendanceOverview(s.getId()).getOverallPercentage();
                }
                deptAtt.put(d.getCode(), Math.round((deptSum / deptStudents.size()) * 10.0) / 10.0);
            } else {
                deptAtt.put(d.getCode(), 0.0);
            }
        }

        DashboardStatsDto.AdminDashboardStats stats = new DashboardStatsDto.AdminDashboardStats();
        stats.setTotalStudents(totalStudents);
        stats.setTotalFaculty(totalFaculty);
        stats.setTotalDepartments(totalDepartments);
        stats.setTotalActiveUsers(totalActiveUsers);
        stats.setAverageAttendance(avgAttendance);
        stats.setAverageStudentPerformance(avgPerformance);
        stats.setPendingLeaveRequests(pendingLeaves);
        stats.setPendingAchievements(pendingAchievements);
        stats.setStudentDistribution(studentDist);
        stats.setDepartmentAttendance(deptAtt);

        return stats;
    }
}
