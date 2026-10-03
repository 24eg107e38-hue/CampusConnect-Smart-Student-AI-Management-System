package com.example.campusconnect.service;

import com.example.campusconnect.dto.MarksDto;
import com.example.campusconnect.dto.MarksEntryRequest;
import com.example.campusconnect.entity.Marks;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.entity.Subject;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.MarksRepository;
import com.example.campusconnect.repository.StudentRepository;
import com.example.campusconnect.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MarksService {

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Transactional
    public MarksDto addOrUpdateMarks(MarksEntryRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));

        Optional<Marks> existingOpt = marksRepository.findByStudentIdAndSubjectIdAndSemester(
                student.getId(), subject.getId(), request.getSemester()
        );

        Marks marks = existingOpt.orElseGet(Marks::new);
        marks.setStudent(student);
        marks.setSubject(subject);
        marks.setSemester(request.getSemester());
        marks.setInternalMarks(request.getInternalMarks());
        marks.setAssignmentMarks(request.getAssignmentMarks());
        marks.setMidExamMarks(request.getMidExamMarks());
        marks.setFinalExamMarks(request.getFinalExamMarks());
        marks.calculateTotalAndGrade();

        Marks saved = marksRepository.save(marks);
        return mapToDto(saved);
    }

    public List<MarksDto> getMarksByStudent(Long studentId) {
        return marksRepository.findByStudentId(studentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<MarksDto> getMarksBySubject(Long subjectId) {
        return marksRepository.findBySubjectId(subjectId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public MarksDto mapToDto(Marks m) {
        MarksDto dto = new MarksDto();
        dto.setId(m.getId());
        dto.setStudentId(m.getStudent().getId());
        dto.setStudentName(m.getStudent().getUser().getFullName());
        dto.setStudentRollNo(m.getStudent().getStudentId());
        dto.setSubjectId(m.getSubject().getId());
        dto.setSubjectCode(m.getSubject().getCode());
        dto.setSubjectName(m.getSubject().getName());
        dto.setSemester(m.getSemester());
        dto.setInternalMarks(m.getInternalMarks());
        dto.setAssignmentMarks(m.getAssignmentMarks());
        dto.setMidExamMarks(m.getMidExamMarks());
        dto.setFinalExamMarks(m.getFinalExamMarks());
        dto.setTotalMarks(m.getTotalMarks());
        dto.setPercentage(m.getPercentage());
        dto.setGrade(m.getGrade());
        return dto;
    }
}
