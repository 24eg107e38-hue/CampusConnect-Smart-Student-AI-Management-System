package com.example.campusconnect.service;

import com.example.campusconnect.dto.PerformanceAnalysisDto;
import com.example.campusconnect.dto.StudentDto;
import com.example.campusconnect.entity.Department;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.entity.User;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.DepartmentRepository;
import com.example.campusconnect.repository.StudentRepository;
import com.example.campusconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PerformanceService performanceService;

    public List<StudentDto> getAllStudents() {
        return studentRepository.findAll()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        return mapToDto(student);
    }

    public StudentDto getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user ID: " + userId));
        return mapToDto(student);
    }

    public List<StudentDto> searchStudents(String search, Long deptId, Integer year, String course,
                                          Double minAttendance, Double maxAttendance, String performanceStatus) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String courseFilter = (course != null && !course.trim().isEmpty()) ? course.trim() : null;
        Long deptFilter = (deptId != null && deptId > 0) ? deptId : null;
        Integer yearFilter = (year != null && year > 0) ? year : null;

        List<Student> students = studentRepository.searchStudents(query, deptFilter, yearFilter, courseFilter);

        return students.stream()
                .filter(s -> {
                    if (minAttendance != null || maxAttendance != null || (performanceStatus != null && !performanceStatus.isEmpty() && !"ALL".equalsIgnoreCase(performanceStatus))) {
                        PerformanceAnalysisDto perf = performanceService.analyzePerformance(s.getId());
                        if (minAttendance != null && perf.getAttendancePercentage() < minAttendance) {
                            return false;
                        }
                        if (maxAttendance != null && perf.getAttendancePercentage() > maxAttendance) {
                            return false;
                        }
                        if (performanceStatus != null && !performanceStatus.isEmpty() && !"ALL".equalsIgnoreCase(performanceStatus)) {
                            if (!perf.getOverallStatus().equalsIgnoreCase(performanceStatus.trim())) {
                                return false;
                            }
                        }
                    }
                    return true;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentDto updateStudentProfile(Long id, StudentDto dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        User user = student.getUser();
        if (dto.getFullName() != null && !dto.getFullName().trim().isEmpty()) {
            user.setFullName(dto.getFullName().trim());
        }
        if (dto.getPhoneNumber() != null) {
            user.setPhoneNumber(dto.getPhoneNumber().trim());
        }
        userRepository.save(user);

        if (dto.getAddress() != null) {
            student.setAddress(dto.getAddress().trim());
        }
        if (dto.getProfilePhoto() != null) {
            student.setProfilePhoto(dto.getProfilePhoto().trim());
        }
        if (dto.getCourse() != null && !dto.getCourse().trim().isEmpty()) {
            student.setCourse(dto.getCourse().trim());
        }
        if (dto.getYear() > 0) {
            student.setYear(dto.getYear());
            student.setSemester(dto.getYear() * 2 - 1);
        }
        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
            student.setDepartment(dept);
        }

        Student saved = studentRepository.save(student);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        studentRepository.delete(student);
    }

    public StudentDto mapToDto(Student s) {
        StudentDto dto = new StudentDto();
        dto.setId(s.getId());
        dto.setUserId(s.getUser().getId());
        dto.setStudentId(s.getStudentId());
        dto.setFullName(s.getUser().getFullName());
        dto.setEmail(s.getUser().getEmail());
        dto.setPhoneNumber(s.getUser().getPhoneNumber());
        if (s.getDepartment() != null) {
            dto.setDepartmentId(s.getDepartment().getId());
            dto.setDepartmentName(s.getDepartment().getName());
            dto.setDepartmentCode(s.getDepartment().getCode());
        }
        dto.setCourse(s.getCourse());
        dto.setYear(s.getYear());
        dto.setSemester(s.getSemester());
        dto.setDateOfJoining(s.getDateOfJoining());
        dto.setProfilePhoto(s.getProfilePhoto());
        dto.setAddress(s.getAddress());
        return dto;
    }
}
