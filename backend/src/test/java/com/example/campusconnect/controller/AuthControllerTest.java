package com.example.campusconnect.controller;

import com.example.campusconnect.dto.LoginRequest;
import com.example.campusconnect.dto.LoginResponse;
import com.example.campusconnect.dto.RegisterRequest;
import com.example.campusconnect.entity.Department;
import com.example.campusconnect.entity.Role;
import com.example.campusconnect.service.AuthService;
import com.example.campusconnect.service.DepartmentService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController MockMvc Endpoint Tests")
public class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @Mock
    private DepartmentService departmentService;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    @DisplayName("GET /api/auth/departments should return list of active departments")
    void shouldReturnDepartments() throws Exception {
        Department dept = new Department();
        dept.setId(1L);
        dept.setCode("CSE");
        dept.setName("Computer Science & Engineering");

        when(departmentService.getAllDepartments()).thenReturn(List.of(dept));

        mockMvc.perform(get("/api/auth/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].code").value("CSE"))
                .andExpect(jsonPath("$.data[0].name").value("Computer Science & Engineering"));
    }

    @Test
    @DisplayName("POST /api/auth/login should authenticate user and return JWT token")
    void shouldLoginSuccessfully() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("student@campusconnect.edu");
        request.setPassword("Student@123");

        LoginResponse response = new LoginResponse();
        response.setToken("mock-jwt-token-12345");
        response.setUserId(1L);
        response.setEmail("student@campusconnect.edu");
        response.setFullName("Student One");
        response.setRole(Role.ROLE_STUDENT);

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock-jwt-token-12345"))
                .andExpect(jsonPath("$.data.email").value("student@campusconnect.edu"))
                .andExpect(jsonPath("$.data.role").value("ROLE_STUDENT"));
    }

    @Test
    @DisplayName("POST /api/auth/register should create student and return initial session")
    void shouldRegisterStudentSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new.student@campusconnect.edu");
        request.setPassword("SecurePassword@123");
        request.setConfirmPassword("SecurePassword@123");
        request.setFullName("New Student");
        request.setPhoneNumber("+91-9876543210");
        request.setDepartmentId(1L);
        request.setCourse("B.Tech Computer Science");
        request.setYear(1);
        request.setStudentId("STU2026999");

        LoginResponse response = new LoginResponse();
        response.setToken("new-user-jwt-token");
        response.setUserId(2L);
        response.setEmail("new.student@campusconnect.edu");
        response.setFullName("New Student");
        response.setRole(Role.ROLE_STUDENT);

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("new-user-jwt-token"))
                .andExpect(jsonPath("$.data.fullName").value("New Student"));
    }
}
