package com.example.campusconnect.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PasswordEncoder Unit Tests")
public class PasswordEncoderTest {

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new PasswordEncoder();
    }

    @Test
    @DisplayName("Should encode password into PBKDF2 formatted string with salt")
    void shouldEncodePasswordCorrectly() {
        String rawPassword = "SecurePassword@2026!";
        String encoded = passwordEncoder.encode(rawPassword);

        assertNotNull(encoded);
        assertTrue(encoded.startsWith("$pbkdf2$12000$"));
        assertNotEquals(rawPassword, encoded);
    }

    @Test
    @DisplayName("Should produce different hashes for the same raw password due to cryptographic salt")
    void shouldProduceDifferentHashesDueToSalt() {
        String rawPassword = "SamePassword123";
        String encoded1 = passwordEncoder.encode(rawPassword);
        String encoded2 = passwordEncoder.encode(rawPassword);

        assertNotNull(encoded1);
        assertNotNull(encoded2);
        assertNotEquals(encoded1, encoded2, "Salt must ensure identical passwords result in distinct hashes");
    }

    @Test
    @DisplayName("Should verify matching password correctly")
    void shouldMatchCorrectPassword() {
        String rawPassword = "Student@Password123";
        String encoded = passwordEncoder.encode(rawPassword);

        assertTrue(passwordEncoder.matches(rawPassword, encoded));
    }

    @Test
    @DisplayName("Should reject incorrect password")
    void shouldRejectIncorrectPassword() {
        String rawPassword = "Student@Password123";
        String wrongPassword = "WrongPassword999";
        String encoded = passwordEncoder.encode(rawPassword);

        assertFalse(passwordEncoder.matches(wrongPassword, encoded));
    }

    @Test
    @DisplayName("Should handle null or malformed inputs safely")
    void shouldHandleNullOrMalformedInputs() {
        assertThrows(IllegalArgumentException.class, () -> passwordEncoder.encode(null));
        assertFalse(passwordEncoder.matches(null, "$pbkdf2$12000$salt$hash"));
        assertFalse(passwordEncoder.matches("password", null));
        assertFalse(passwordEncoder.matches("password", "invalidHashFormat"));
    }
}
