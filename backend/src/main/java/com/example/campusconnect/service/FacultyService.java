package com.example.campusconnect.service;

import com.example.campusconnect.dto.FacultyDto;
import com.example.campusconnect.entity.Department;
import com.example.campusconnect.entity.Faculty;
import com.example.campusconnect.entity.Role;
import com.example.campusconnect.entity.User;
import com.example.campusconnect.exception.DuplicateResourceException;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.DepartmentRepository;
import com.example.campusconnect.repository.FacultyRepository;
import com.example.campusconnect.repository.UserRepository;
import com.example.campusconnect.config.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<FacultyDto> getAllFaculty() {
        return facultyRepository.findAll()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public FacultyDto getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));
        return mapToDto(faculty);
    }

    public FacultyDto getFacultyByUserId(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found for user ID: " + userId));
        return mapToDto(faculty);
    }

    @Transactional
    public FacultyDto createFaculty(FacultyDto dto, String rawPassword) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("User with email " + dto.getEmail() + " already exists");
        }
        if (facultyRepository.existsByFacultyId(dto.getFacultyId())) {
            throw new DuplicateResourceException("Faculty ID " + dto.getFacultyId() + " already exists");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        User user = new User();
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(rawPassword != null ? rawPassword : "Faculty@123"));
        user.setFullName(dto.getFullName().trim());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setRole(Role.ROLE_FACULTY);
        user.setActive(true);
        user = userRepository.save(user);

        Faculty faculty = new Faculty();
        faculty.setUser(user);
        faculty.setFacultyId(dto.getFacultyId().trim());
        faculty.setDepartment(department);
        faculty.setDesignation(dto.getDesignation());
        faculty.setQualification(dto.getQualification());
        faculty.setSpecialization(dto.getSpecialization());

        Faculty saved = facultyRepository.save(faculty);
        return mapToDto(saved);
    }

    @Transactional
    public FacultyDto updateFaculty(Long id, FacultyDto dto) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));

        User user = faculty.getUser();
        if (dto.getFullName() != null) user.setFullName(dto.getFullName().trim());
        if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber().trim());
        userRepository.save(user);

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
            faculty.setDepartment(department);
        }
        if (dto.getDesignation() != null) faculty.setDesignation(dto.getDesignation());
        if (dto.getQualification() != null) faculty.setQualification(dto.getQualification());
        if (dto.getSpecialization() != null) faculty.setSpecialization(dto.getSpecialization());

        Faculty saved = facultyRepository.save(faculty);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteFaculty(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));
        facultyRepository.delete(faculty);
    }

    public FacultyDto mapToDto(Faculty f) {
        FacultyDto dto = new FacultyDto();
        dto.setId(f.getId());
        dto.setUserId(f.getUser().getId());
        dto.setFacultyId(f.getFacultyId());
        dto.setFullName(f.getUser().getFullName());
        dto.setEmail(f.getUser().getEmail());
        dto.setPhoneNumber(f.getUser().getPhoneNumber());
        if (f.getDepartment() != null) {
            dto.setDepartmentId(f.getDepartment().getId());
            dto.setDepartmentName(f.getDepartment().getName());
            dto.setDepartmentCode(f.getDepartment().getCode());
        }
        dto.setDesignation(f.getDesignation());
        dto.setQualification(f.getQualification());
        dto.setSpecialization(f.getSpecialization());
        return dto;
    }
}
