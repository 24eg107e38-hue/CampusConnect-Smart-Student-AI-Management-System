package com.example.campusconnect.service;

import com.example.campusconnect.dto.GoalDto;
import com.example.campusconnect.entity.AcademicGoal;
import com.example.campusconnect.entity.Student;
import com.example.campusconnect.exception.ResourceNotFoundException;
import com.example.campusconnect.repository.AcademicGoalRepository;
import com.example.campusconnect.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalService {

    @Autowired
    private AcademicGoalRepository goalRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public GoalDto createGoal(GoalDto.GoalRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        AcademicGoal goal = new AcademicGoal();
        goal.setStudent(student);
        goal.setTitle(request.getTitle());
        goal.setGoalType(request.getGoalType().toUpperCase());
        goal.setTargetValue(request.getTargetValue());
        goal.setCurrentValue(request.getCurrentValue() != null ? request.getCurrentValue() : 0.0);
        goal.setUnit(request.getUnit() != null ? request.getUnit() : "%");
        goal.setTargetDate(request.getTargetDate());

        if (goal.getCurrentValue() >= goal.getTargetValue()) {
            goal.setStatus("ACHIEVED");
        } else {
            goal.setStatus("IN_PROGRESS");
        }

        AcademicGoal saved = goalRepository.save(goal);
        return mapToDto(saved);
    }

    public List<GoalDto> getGoalsByStudent(Long studentId) {
        return goalRepository.findByStudentId(studentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public GoalDto updateGoalProgress(Long goalId, Double currentValue) {
        AcademicGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        goal.setCurrentValue(currentValue);
        if (goal.getTargetValue() != null && goal.getCurrentValue() >= goal.getTargetValue()) {
            goal.setStatus("ACHIEVED");
        } else {
            goal.setStatus("IN_PROGRESS");
        }

        AcademicGoal saved = goalRepository.save(goal);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteGoal(Long goalId) {
        AcademicGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));
        goalRepository.delete(goal);
    }

    public GoalDto mapToDto(AcademicGoal g) {
        GoalDto dto = new GoalDto();
        dto.setId(g.getId());
        dto.setStudentId(g.getStudent().getId());
        dto.setTitle(g.getTitle());
        dto.setGoalType(g.getGoalType());
        dto.setTargetValue(g.getTargetValue());
        dto.setCurrentValue(g.getCurrentValue());
        dto.setUnit(g.getUnit());
        dto.setTargetDate(g.getTargetDate());
        dto.setStatus(g.getStatus());

        double progress = 0.0;
        if (g.getTargetValue() != null && g.getTargetValue() > 0) {
            double cur = g.getCurrentValue() != null ? g.getCurrentValue() : 0.0;
            progress = Math.min(100.0, Math.round((cur / g.getTargetValue()) * 1000.0) / 10.0);
        }
        dto.setProgressPercentage(progress);

        return dto;
    }
}
