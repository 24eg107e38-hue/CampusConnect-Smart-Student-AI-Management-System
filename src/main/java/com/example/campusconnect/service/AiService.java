package com.example.campusconnect.service;

import com.example.campusconnect.dto.AiChatDto;
import com.example.campusconnect.dto.PerformanceExplanationDto;
import com.example.campusconnect.dto.StudyPlanDto;

public interface AiService {

    AiChatDto.Response chatWithAssistant(AiChatDto.Request request);

    StudyPlanDto.Response generateStudyPlan(StudyPlanDto.Request request);

    PerformanceExplanationDto explainPerformance(Long studentId);
}
