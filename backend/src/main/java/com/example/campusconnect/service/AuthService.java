package com.example.campusconnect.service;

import com.example.campusconnect.config.JwtTokenProvider;
import com.example.campusconnect.dto.LoginRequest;
import com.example.campusconnect.dto.LoginResponse;
import com.example.campusconnect.dto.RegisterRequest;
import com.example.campusconnect.entity.Department;
import com.example.campusconnect.entity.Faculty;
import com.example.campusconnect.entity.Role;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.entity.User;
import com.example.campusconnect.exception.BadRequestException;
import com.example.campusconnect.exception.DuplicateResourceException;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.exception.UnauthorizedException;
import com.example.campusconnect.repository.DepartmentRepository;
import com.example.campusconnect.repository.FacultyRepository;
import com.example.campusconnect.repository.StudentRepository;
import com.example.campusconnect.repository.UserRepository;
import com.example.campusconnect.config.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new DuplicateResourceException("An account with email " + request.getEmail() + " already exists");
        }

        if (studentRepository.existsByStudentId(request.getStudentId().trim())) {
            throw new DuplicateResourceException("Student ID " + request.getStudentId() + " is already registered");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber().trim());
        user.setRole(Role.ROLE_STUDENT);
        user.setActive(true);
        user = userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setStudentId(request.getStudentId().trim());
        student.setDepartment(department);
        student.setCourse(request.getCourse().trim());
        student.setYear(request.getYear());
        student.setSemester(request.getYear() * 2 - 1);
        student.setDateOfJoining(LocalDate.now());
        student = studentRepository.save(student);

        String token = jwtTokenProvider.generateToken(user);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());
        response.setProfileId(student.getId());
        response.setRollOrFacultyId(student.getStudentId());
        response.setDepartmentId(department.getId());
        response.setDepartmentName(department.getName());
        response.setDepartmentCode(department.getCode());
        response.setCourse(student.getCourse());
        response.setYear(student.getYear());

        return response;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account is deactivated. Please contact college administration.");
        }

        String token = jwtTokenProvider.generateToken(user);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());

        if (user.getRole() == Role.ROLE_STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByUserId(user.getId());
            studentOpt.ifPresent(student -> {
                response.setProfileId(student.getId());
                response.setRollOrFacultyId(student.getStudentId());
                if (student.getDepartment() != null) {
                    response.setDepartmentId(student.getDepartment().getId());
                    response.setDepartmentName(student.getDepartment().getName());
                    response.setDepartmentCode(student.getDepartment().getCode());
                }
                response.setCourse(student.getCourse());
                response.setYear(student.getYear());
            });
        } else if (user.getRole() == Role.ROLE_FACULTY) {
            Optional<Faculty> facultyOpt = facultyRepository.findByUserId(user.getId());
            facultyOpt.ifPresent(faculty -> {
                response.setProfileId(faculty.getId());
                response.setRollOrFacultyId(faculty.getFacultyId());
                if (faculty.getDepartment() != null) {
                    response.setDepartmentId(faculty.getDepartment().getId());
                    response.setDepartmentName(faculty.getDepartment().getName());
                    response.setDepartmentCode(faculty.getDepartment().getCode());
                }
            });
        }

        return response;
    }
}
