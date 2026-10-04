package com.example.campusconnect.config;

import com.example.campusconnect.entity.Role;
import com.example.campusconnect.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JwtTokenProvider Unit Tests")
public class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private User testUser;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", "TestSecretKeyForTestingCampusConnectJwtTokenGeneration2026SecureKey!");
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationInMs", 3600000L); // 1 hour

        testUser = new User();
        testUser.setId(101L);
        testUser.setEmail("rahul.sharma@campusconnect.edu");
        testUser.setFullName("Rahul Sharma");
        testUser.setRole(Role.ROLE_STUDENT);
        testUser.setActive(true);
    }

    @Test
    @DisplayName("Should generate valid JWT token with user claims")
    void shouldGenerateValidToken() {
        String token = tokenProvider.generateToken(testUser);

        assertNotNull(token);
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length, "JWT must contain header, payload, and signature");
        assertTrue(tokenProvider.validateToken(token), "Token should be validated successfully");
    }

    @Test
    @DisplayName("Should extract correct email, userId, and role from token")
    void shouldExtractClaimsCorrectly() {
        String token = tokenProvider.generateToken(testUser);

        String email = tokenProvider.getEmailFromToken(token);
        Long userId = tokenProvider.getUserIdFromToken(token);
        Role role = tokenProvider.getRoleFromToken(token);

        assertEquals("rahul.sharma@campusconnect.edu", email);
        assertEquals(101L, userId);
        assertEquals(Role.ROLE_STUDENT, role);
    }

    @Test
    @DisplayName("Should reject tampered token")
    void shouldRejectTamperedToken() {
        String token = tokenProvider.generateToken(testUser);
        String tampered = token.substring(0, token.length() - 5) + "abcde";

        assertFalse(tokenProvider.validateToken(tampered));
    }

    @Test
    @DisplayName("Should reject expired token")
    void shouldRejectExpiredToken() {
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationInMs", -1000L); // Already expired
        String expiredToken = tokenProvider.generateToken(testUser);

        assertFalse(tokenProvider.validateToken(expiredToken));
    }

    @Test
    @DisplayName("Should handle null and malformed tokens safely")
    void shouldHandleNullAndMalformedTokens() {
        assertFalse(tokenProvider.validateToken(null));
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken("not.a.valid.jwt.token"));
    }
}
