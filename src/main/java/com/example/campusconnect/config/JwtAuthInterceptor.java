package com.example.campusconnect.config;

import com.example.campusconnect.entity.Role;
import com.example.campusconnect.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow pre-flight CORS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String uri = request.getRequestURI();

        // Allow public static resources and auth endpoints
        if (uri.startsWith("/api/auth/") || uri.startsWith("/api/public/") || !uri.startsWith("/api/")) {
            return true;
        }

        String token = getJwtFromRequest(request);

        if (!StringUtils.hasText(token) || !tokenProvider.validateToken(token)) {
            // Check if endpoint is protected
            throw new UnauthorizedException("Authentication token is missing or invalid. Please login.");
        }

        Long userId = tokenProvider.getUserIdFromToken(token);
        String email = tokenProvider.getEmailFromToken(token);
        Role role = tokenProvider.getRoleFromToken(token);

        request.setAttribute("currentUserId", userId);
        request.setAttribute("currentUserEmail", email);
        request.setAttribute("currentUserRole", role);

        // Check @RequireRole annotation if present on method or class
        if (handler instanceof HandlerMethod handlerMethod) {
            RequireRole methodAnnotation = handlerMethod.getMethodAnnotation(RequireRole.class);
            RequireRole classAnnotation = handlerMethod.getBeanType().getAnnotation(RequireRole.class);

            RequireRole requireRole = methodAnnotation != null ? methodAnnotation : classAnnotation;
            if (requireRole != null && requireRole.value().length > 0) {
                boolean hasAllowedRole = Arrays.asList(requireRole.value()).contains(role);
                if (!hasAllowedRole) {
                    throw new UnauthorizedException("Access denied: You do not have the required role to access this resource.");
                }
            }
        }

        return true;
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
