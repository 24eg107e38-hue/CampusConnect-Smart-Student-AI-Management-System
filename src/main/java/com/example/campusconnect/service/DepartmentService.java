package com.example.campusconnect.service;

import com.example.campusconnect.entity.Department;
import com.example.campusconnect.exception.DuplicateResourceException;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
    }

    public Department createDepartment(Department department) {
        if (departmentRepository.existsByCode(department.getCode())) {
            throw new DuplicateResourceException("Department with code " + department.getCode() + " already exists");
        }
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department updated) {
        Department existing = getDepartmentById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id) {
        Department existing = getDepartmentById(id);
        departmentRepository.delete(existing);
    }
}
