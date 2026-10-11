package com.example.campusconnect.controller;

import com.example.campusconnect.dto.AiChatDto;
import com.example.campusconnect.dto.PerformanceExplanationDto;
import com.example.campusconnect.dto.StudyPlanDto;
import com.example.campusconnect.repository.StudentRepository;
import com.example.campusconnect.service.AiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiController MockMvc Endpoint Tests")
public class AiControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AiService aiService;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private AiController aiController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(aiController).build();
    }

    @Test
    @DisplayName("POST /api/ai/assistant/chat should return assistant reply and suggested prompts")
    void shouldReturnAssistantChatResponse() throws Exception {
        AiChatDto.Request request = new AiChatDto.Request();
        request.setStudentId(1L);
        request.setMessage("How is my attendance?");

        AiChatDto.Response response = new AiChatDto.Response(
                "Your attendance is 85.0%. Good standing!",
                List.of("Generate study plan", "View subjects"),
                "Student Context Summary"
        );

        when(aiService.chatWithAssistant(any(AiChatDto.Request.class))).thenReturn(response);

        mockMvc.perform(post("/api/ai/assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reply").value("Your attendance is 85.0%. Good standing!"))
                .andExpect(jsonPath("$.data.suggestions[0]").value("Generate study plan"));
    }

    @Test
    @DisplayName("POST /api/ai/study-plan should return generated weekly timetable and tips")
    void shouldGenerateStudyPlan() throws Exception {
        StudyPlanDto.Request request = new StudyPlanDto.Request();
        request.setStudentId(1L);
        request.setDailyHours(3.0);
        request.setFocusGoal("Improve Operating Systems score");

        StudyPlanDto.Response response = new StudyPlanDto.Response();
        response.setStudentId(1L);
        response.setStudentName("Rahul Sharma");
        response.setDailyHours(3.0);
        response.setWeeklySchedule(Map.of("Monday", List.of()));
        response.setStrategicTips(List.of("Use active recall", "Apply 50/10 Pomodoro"));

        when(aiService.generateStudyPlan(any(StudyPlanDto.Request.class))).thenReturn(response);

        mockMvc.perform(post("/api/ai/study-plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studentName").value("Rahul Sharma"))
                .andExpect(jsonPath("$.data.dailyHours").value(3.0));
    }

    @Test
    @DisplayName("GET /api/ai/performance-explanation/student/{id} should return 3-factor breakdown")
    void shouldReturnPerformanceExplanation() throws Exception {
        PerformanceExplanationDto explanation = new PerformanceExplanationDto();
        explanation.setStudentId(1L);
        explanation.setStudentName("Rahul Sharma");
        explanation.setOverallPerformanceScore(83.0);
        explanation.setPerformanceTier("Good");

        when(aiService.explainPerformance(eq(1L))).thenReturn(explanation);

        mockMvc.perform(get("/api/ai/performance-explanation/student/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.overallPerformanceScore").value(83.0))
                .andExpect(jsonPath("$.data.performanceTier").value("Good"));
    }
}
