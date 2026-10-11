package com.example.campusconnect.service;

import com.example.campusconnect.dto.AttendanceMarkRequest;
import com.example.campusconnect.dto.AttendanceRecordDto;
import com.example.campusconnect.dto.AttendanceSummaryDto;
import com.example.campusconnect.entity.Attendance;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.entity.Subject;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.AttendanceRepository;
import com.example.campusconnect.repository.StudentRepository;
import com.example.campusconnect.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Transactional
    public List<AttendanceRecordDto> markAttendance(AttendanceMarkRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));

        LocalDate date = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now();
        List<AttendanceRecordDto> savedList = new ArrayList<>();

        for (AttendanceMarkRequest.StudentAttendanceItem item : request.getStudents()) {
            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + item.getStudentId()));

            Optional<Attendance> existingOpt = attendanceRepository
                    .findByStudentIdAndSubjectIdAndAttendanceDate(student.getId(), subject.getId(), date);

            Attendance record = existingOpt.orElseGet(Attendance::new);
            record.setStudent(student);
            record.setSubject(subject);
            record.setAttendanceDate(date);
            record.setStatus(item.getStatus().toUpperCase());
            record.setRemarks(item.getRemarks());

            Attendance saved = attendanceRepository.save(record);
            savedList.add(mapToDto(saved));
        }

        return savedList;
    }

    public List<AttendanceRecordDto> getAttendanceForSubjectAndDate(Long subjectId, LocalDate date) {
        return attendanceRepository.findBySubjectIdAndAttendanceDate(subjectId, date)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<AttendanceRecordDto> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public AttendanceSummaryDto getStudentAttendanceOverview(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        List<Attendance> allRecords = attendanceRepository.findByStudentId(studentId);

        long totalClasses = allRecords.size();
        long presentClasses = allRecords.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
        long absentClasses = totalClasses - presentClasses;

        double overallPercentage = totalClasses > 0
                ? Math.round(((double) presentClasses / totalClasses) * 1000.0) / 10.0
                : 100.0;

        boolean belowThreshold = overallPercentage < 75.0;
        String alertMessage = belowThreshold
                ? "Attendance Alert: Your attendance is " + overallPercentage + "%, which is below the mandatory 75% requirement. Please attend upcoming lectures."
                : null;

        // Group by Subject
        Map<Long, List<Attendance>> bySubject = allRecords.stream()
                .collect(Collectors.groupingBy(a -> a.getSubject().getId()));

        // Also include enrolled subjects with 0 records
        List<Subject> enrolledSubjects = subjectRepository.findByDepartmentIdAndYear(
                student.getDepartment().getId(), student.getYear()
        );

        List<AttendanceSummaryDto.SubjectAttendanceDto> subjectDtos = new ArrayList<>();
        Set<Long> processedSubjects = new HashSet<>();

        for (Subject subject : enrolledSubjects) {
            processedSubjects.add(subject.getId());
            List<Attendance> records = bySubject.getOrDefault(subject.getId(), Collections.emptyList());
            long subTotal = records.size();
            long subPresent = records.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
            long subAbsent = subTotal - subPresent;
            double subPct = subTotal > 0 ? Math.round(((double) subPresent / subTotal) * 1000.0) / 10.0 : 100.0;

            subjectDtos.add(new AttendanceSummaryDto.SubjectAttendanceDto(
                    subject.getId(),
                    subject.getCode(),
                    subject.getName(),
                    subTotal,
                    subPresent,
                    subAbsent,
                    subPct,
                    subPct < 75.0
            ));
        }

        // Add any additional subjects from records that weren't in enrolled subjects list
        for (Map.Entry<Long, List<Attendance>> entry : bySubject.entrySet()) {
            if (!processedSubjects.contains(entry.getKey())) {
                List<Attendance> records = entry.getValue();
                Subject subject = records.get(0).getSubject();
                long subTotal = records.size();
                long subPresent = records.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
                long subAbsent = subTotal - subPresent;
                double subPct = subTotal > 0 ? Math.round(((double) subPresent / subTotal) * 1000.0) / 10.0 : 100.0;

                subjectDtos.add(new AttendanceSummaryDto.SubjectAttendanceDto(
                        subject.getId(),
                        subject.getCode(),
                        subject.getName(),
                        subTotal,
                        subPresent,
                        subAbsent,
                        subPct,
                        subPct < 75.0
                ));
            }
        }

        AttendanceSummaryDto summary = new AttendanceSummaryDto();
        summary.setStudentId(student.getId());
        summary.setStudentName(student.getUser().getFullName());
        summary.setStudentRollNo(student.getStudentId());
        summary.setDepartmentName(student.getDepartment().getName());
        summary.setTotalWorkingDays(totalClasses);
        summary.setPresentDays(presentClasses);
        summary.setAbsentDays(absentClasses);
        summary.setOverallPercentage(overallPercentage);
        summary.setBelowThreshold(belowThreshold);
        summary.setAlertMessage(alertMessage);
        summary.setSubjectAttendance(subjectDtos);

        return summary;
    }

    private AttendanceRecordDto mapToDto(Attendance a) {
        AttendanceRecordDto dto = new AttendanceRecordDto();
        dto.setId(a.getId());
        dto.setStudentId(a.getStudent().getId());
        dto.setStudentName(a.getStudent().getUser().getFullName());
        dto.setStudentRollNo(a.getStudent().getStudentId());
        dto.setSubjectId(a.getSubject().getId());
        dto.setSubjectCode(a.getSubject().getCode());
        dto.setSubjectName(a.getSubject().getName());
        dto.setAttendanceDate(a.getAttendanceDate());
        dto.setStatus(a.getStatus());
        dto.setRemarks(a.getRemarks());
        return dto;
    }
}
