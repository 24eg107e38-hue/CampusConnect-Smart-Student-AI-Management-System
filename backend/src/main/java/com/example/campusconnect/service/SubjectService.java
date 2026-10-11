package com.example.campusconnect.service;

import com.example.campusconnect.entity.Department;
import com.example.campusconnect.entity.Subject;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.DepartmentRepository;
import com.example.campusconnect.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public List<Subject> getSubjectsByDepartment(Long departmentId) {
        return subjectRepository.findByDepartmentId(departmentId);
    }

    public List<Subject> getSubjectsByDepartmentAndYear(Long departmentId, int year) {
        return subjectRepository.findByDepartmentIdAndYear(departmentId, year);
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));
    }

    public Subject createSubject(Subject subject, Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + departmentId));
        subject.setDepartment(department);
        return subjectRepository.save(subject);
    }
}
