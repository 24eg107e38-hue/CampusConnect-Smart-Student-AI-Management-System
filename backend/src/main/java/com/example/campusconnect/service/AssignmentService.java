package com.example.campusconnect.service;

import com.example.campusconnect.dto.AssignmentCreateRequest;
import com.example.campusconnect.dto.AssignmentDto;
import com.example.campusconnect.dto.AssignmentSubmissionDto;
import com.example.campusconnect.entity.*;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public AssignmentDto createAssignment(AssignmentCreateRequest request, Long facultyUserId) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Faculty faculty = null;
        if (facultyUserId != null) {
            faculty = facultyRepository.findByUserId(facultyUserId).orElse(null);
        }

        Assignment assignment = new Assignment();
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setSubject(subject);
        assignment.setDepartment(department);
        assignment.setYear(request.getYear());
        assignment.setDueDate(request.getDueDate());
        assignment.setMaxMarks(request.getMaxMarks() != null ? request.getMaxMarks() : 10);
        assignment.setCreatedByFaculty(faculty);
        assignment.setCreatedAt(LocalDateTime.now());

        Assignment saved = assignmentRepository.save(assignment);
        return mapToDto(saved, null);
    }

    public List<AssignmentDto> getAllAssignments() {
        return assignmentRepository.findAllByOrderByDueDateDesc()
                .stream().map(a -> mapToDto(a, null)).collect(Collectors.toList());
    }

    public List<AssignmentDto> getAssignmentsForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Assignment> assignments = assignmentRepository.findByDepartmentIdAndYearOrderByDueDateDesc(
                student.getDepartment().getId(), student.getYear()
        );

        return assignments.stream()
                .map(a -> mapToDto(a, student))
                .collect(Collectors.toList());
    }

    public List<AssignmentDto> getAssignmentsByFaculty(Long facultyUserId) {
        Faculty faculty = facultyRepository.findByUserId(facultyUserId).orElse(null);
        if (faculty == null) {
            return getAllAssignments();
        }
        return assignmentRepository.findByCreatedByFacultyIdOrderByDueDateDesc(faculty.getId())
                .stream().map(a -> mapToDto(a, null)).collect(Collectors.toList());
    }

    @Transactional
    public AssignmentSubmissionDto submitAssignment(AssignmentSubmissionDto.SubmitRequest request) {
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + request.getAssignmentId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        Optional<AssignmentSubmission> existingOpt = submissionRepository
                .findByAssignmentIdAndStudentId(assignment.getId(), student.getId());

        AssignmentSubmission submission = existingOpt.orElseGet(AssignmentSubmission::new);
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setSubmissionDate(LocalDateTime.now());
        submission.setStatus("SUBMITTED");
        submission.setSubmissionText(request.getSubmissionText());

        AssignmentSubmission saved = submissionRepository.save(submission);
        return mapSubmissionToDto(saved);
    }

    public List<AssignmentSubmissionDto> getSubmissionsForAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId)
                .stream().map(this::mapSubmissionToDto).collect(Collectors.toList());
    }

    @Transactional
    public AssignmentSubmissionDto gradeSubmission(Long submissionId, AssignmentSubmissionDto.GradeRequest request) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + submissionId));

        submission.setMarksObtained(request.getMarksObtained());
        submission.setFeedback(request.getFeedback());
        submission.setStatus("GRADED");

        AssignmentSubmission saved = submissionRepository.save(submission);
        return mapSubmissionToDto(saved);
    }

    public AssignmentDto mapToDto(Assignment a, Student currentStudent) {
        AssignmentDto dto = new AssignmentDto();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setSubjectId(a.getSubject().getId());
        dto.setSubjectCode(a.getSubject().getCode());
        dto.setSubjectName(a.getSubject().getName());
        dto.setDepartmentId(a.getDepartment().getId());
        dto.setDepartmentName(a.getDepartment().getName());
        dto.setYear(a.getYear());
        dto.setDueDate(a.getDueDate());
        dto.setMaxMarks(a.getMaxMarks());
        dto.setFacultyName(a.getCreatedByFaculty() != null ? a.getCreatedByFaculty().getUser().getFullName() : "Faculty");
        dto.setCreatedAt(a.getCreatedAt());

        long submissionsCount = submissionRepository.findByAssignmentId(a.getId()).size();
        dto.setTotalSubmissions(submissionsCount);

        // Calculate deadline text
        LocalDate today = LocalDate.now();
        long daysDiff = ChronoUnit.DAYS.between(today, a.getDueDate());
        if (daysDiff > 1) {
            dto.setDeadlineNotice("Due in " + daysDiff + " days");
        } else if (daysDiff == 1) {
            dto.setDeadlineNotice("Due tomorrow");
        } else if (daysDiff == 0) {
            dto.setDeadlineNotice("Due today!");
        } else {
            dto.setDeadlineNotice("Overdue by " + Math.abs(daysDiff) + " days");
        }

        if (currentStudent != null) {
            Optional<AssignmentSubmission> subOpt = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), currentStudent.getId());
            if (subOpt.isPresent()) {
                AssignmentSubmission sub = subOpt.get();
                dto.setSubmissionStatus(sub.getStatus()); // SUBMITTED or GRADED
                dto.setMarksObtained(sub.getMarksObtained());
                dto.setFeedback(sub.getFeedback());
                dto.setSubmissionDate(sub.getSubmissionDate());
                dto.setStudentSubmissionText(sub.getSubmissionText());
            } else {
                if (daysDiff < 0) {
                    dto.setSubmissionStatus("OVERDUE");
                } else {
                    dto.setSubmissionStatus("PENDING");
                }
            }
        }

        return dto;
    }

    public AssignmentSubmissionDto mapSubmissionToDto(AssignmentSubmission s) {
        AssignmentSubmissionDto dto = new AssignmentSubmissionDto();
        dto.setId(s.getId());
        dto.setAssignmentId(s.getAssignment().getId());
        dto.setAssignmentTitle(s.getAssignment().getTitle());
        dto.setStudentId(s.getStudent().getId());
        dto.setStudentName(s.getStudent().getUser().getFullName());
        dto.setStudentRollNo(s.getStudent().getStudentId());
        dto.setDepartmentName(s.getStudent().getDepartment().getName());
        dto.setSubmissionDate(s.getSubmissionDate());
        dto.setStatus(s.getStatus());
        dto.setSubmissionText(s.getSubmissionText());
        dto.setMarksObtained(s.getMarksObtained());
        dto.setFeedback(s.getFeedback());
        return dto;
    }
}
