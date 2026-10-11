package com.example.campusconnect.config;

import com.example.campusconnect.entity.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class JwtTokenProvider {

    @Value("${campusconnect.jwt.secret:CampusConnectSecretKeyForJwtAuthenticationTokenGeneration2026SecureKey!}")
    private String jwtSecret;

    @Value("${campusconnect.jwt.expiration-ms:86400000}")
    private long jwtExpirationInMs;

    private static final String HEADER_JSON = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    private static final String ENCODED_HEADER = Base64.getUrlEncoder().withoutPadding()
            .encodeToString(HEADER_JSON.getBytes(StandardCharsets.UTF_8));

    public String generateToken(com.example.campusconnect.entity.User user) {
        try {
            long nowSec = System.currentTimeMillis() / 1000;
            long expSec = nowSec + (jwtExpirationInMs / 1000);

            String payloadJson = "{"
                    + "\"sub\":\"" + escapeJson(user.getEmail()) + "\","
                    + "\"userId\":" + user.getId() + ","
                    + "\"role\":\"" + user.getRole().name() + "\","
                    + "\"fullName\":\"" + escapeJson(user.getFullName()) + "\","
                    + "\"iat\":" + nowSec + ","
                    + "\"exp\":" + expSec
                    + "}";

            String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

            String content = ENCODED_HEADER + "." + encodedPayload;
            String signature = sign(content, jwtSecret);

            return content + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        if (token == null) return false;
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;

        try {
            String content = parts[0] + "." + parts[1];
            String expectedSig = sign(content, jwtSecret);

            if (!MessageDigest.isEqual(expectedSig.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            String payload = getPayloadString(token);
            if (payload == null) return false;

            Long exp = extractLongField(payload, "exp");
            if (exp == null) return false;

            long now = System.currentTimeMillis() / 1000;
            return now <= exp;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        String payload = getPayloadString(token);
        return extractStringField(payload, "sub");
    }

    public Long getUserIdFromToken(String token) {
        String payload = getPayloadString(token);
        return extractLongField(payload, "userId");
    }

    public Role getRoleFromToken(String token) {
        String payload = getPayloadString(token);
        String roleStr = extractStringField(payload, "role");
        return roleStr != null ? Role.valueOf(roleStr) : null;
    }

    private String getPayloadString(String token) {
        try {
            String[] parts = token.split("\\.");
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }

    private String extractStringField(String json, String field) {
        if (json == null) return null;
        Pattern pattern = Pattern.compile("\"" + field + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return unescapeJson(matcher.group(1));
        }
        return null;
    }

    private Long extractLongField(String json, String field) {
        if (json == null) return null;
        Pattern pattern = Pattern.compile("\"" + field + "\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return Long.parseLong(matcher.group(1));
        }
        return null;
    }

    private String sign(String content, String secret) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmac.init(keySpec);
        byte[] sigBytes = hmac.doFinal(content.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(sigBytes);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String unescapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\\"", "\"")
                .replace("\\\\", "\\");
    }
}
