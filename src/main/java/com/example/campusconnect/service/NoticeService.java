package com.example.campusconnect.service;

import com.example.campusconnect.dto.NoticeDto;
import com.example.campusconnect.entity.Department;
import com.example.campusconnect.entity.Notice;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.DepartmentRepository;
import com.example.campusconnect.repository.NoticeRepository;
import com.example.campusconnect.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public NoticeDto createNotice(NoticeDto.CreateRequest request) {
        Department department = null;
        if (request.getTargetDepartmentId() != null && request.getTargetDepartmentId() > 0) {
            department = departmentRepository.findById(request.getTargetDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getTargetDepartmentId()));
        }

        Notice notice = new Notice();
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setTargetDepartment(department);
        notice.setTargetYear(request.getTargetYear());
        notice.setPriority(request.getPriority() != null ? request.getPriority().toUpperCase() : "NORMAL");
        notice.setPostedBy(request.getPostedBy() != null ? request.getPostedBy() : "Administration");
        notice.setCreatedAt(LocalDateTime.now());

        Notice saved = noticeRepository.save(notice);
        return mapToDto(saved);
    }

    public List<NoticeDto> getAllNotices() {
        return noticeRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<NoticeDto> getNoticesForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        Long deptId = student.getDepartment() != null ? student.getDepartment().getId() : null;
        Integer year = student.getYear();

        return noticeRepository.findNoticesForStudent(deptId, year)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with ID: " + noticeId));
        noticeRepository.delete(notice);
    }

    public NoticeDto mapToDto(Notice n) {
        NoticeDto dto = new NoticeDto();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setContent(n.getContent());
        if (n.getTargetDepartment() != null) {
            dto.setTargetDepartmentId(n.getTargetDepartment().getId());
            dto.setTargetDepartmentName(n.getTargetDepartment().getName());
        } else {
            dto.setTargetDepartmentName("All Departments");
        }
        dto.setTargetYear(n.getTargetYear());
        dto.setPriority(n.getPriority());
        dto.setPostedBy(n.getPostedBy());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
