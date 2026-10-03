package com.example.campusconnect.service;

import com.example.campusconnect.dto.LeaveRequestDto;
import com.example.campusconnect.entity.Faculty;
import com.example.campusconnect.entity.LeaveRequest;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.FacultyRepository;
import com.example.campusconnect.repository.LeaveRequestRepository;
import com.example.campusconnect.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Transactional
    public LeaveRequestDto applyLeave(LeaveRequestDto.ApplyRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        LeaveRequest leave = new LeaveRequest();
        leave.setStudent(student);
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus("PENDING");
        leave.setAppliedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRepository.save(leave);
        return mapToDto(saved);
    }

    public List<LeaveRequestDto> getLeavesByStudent(Long studentId) {
        return leaveRepository.findByStudentIdOrderByAppliedAtDesc(studentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getAllLeaves() {
        return leaveRepository.findAllByOrderByAppliedAtDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getLeavesByDepartment(Long departmentId) {
        return leaveRepository.findByStudentDepartmentIdOrderByAppliedAtDesc(departmentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getPendingLeaves() {
        return leaveRepository.findByStatusOrderByAppliedAtDesc("PENDING")
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDto updateLeaveStatus(Long leaveId, LeaveRequestDto.StatusUpdateRequest request, Long facultyUserId) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + leaveId));

        leave.setStatus(request.getStatus().toUpperCase());
        leave.setReviewComments(request.getComments());

        if (facultyUserId != null) {
            facultyRepository.findByUserId(facultyUserId).ifPresent(leave::setReviewedBy);
        }

        LeaveRequest saved = leaveRepository.save(leave);
        return mapToDto(saved);
    }

    public LeaveRequestDto mapToDto(LeaveRequest l) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(l.getId());
        dto.setStudentId(l.getStudent().getId());
        dto.setStudentName(l.getStudent().getUser().getFullName());
        dto.setStudentRollNo(l.getStudent().getStudentId());
        dto.setDepartmentName(l.getStudent().getDepartment().getName());
        dto.setLeaveType(l.getLeaveType());
        dto.setStartDate(l.getStartDate());
        dto.setEndDate(l.getEndDate());
        dto.setReason(l.getReason());
        dto.setStatus(l.getStatus());
        if (l.getReviewedBy() != null) {
            dto.setReviewedByName(l.getReviewedBy().getUser().getFullName());
        }
        dto.setReviewComments(l.getReviewComments());
        dto.setAppliedAt(l.getAppliedAt());
        return dto;
    }
}
