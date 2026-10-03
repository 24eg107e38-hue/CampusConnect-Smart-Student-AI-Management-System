package com.example.campusconnect.dto;

import com.example.campusconnect.entity.Role;

public class LoginResponse {
    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private Long profileId; // student id or faculty id
    private String rollOrFacultyId; // e.g. STU2024001 or FAC202401
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String course;
    private Integer year;

    public LoginResponse() {}

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public String getRollOrFacultyId() {
        return rollOrFacultyId;
    }

    public void setRollOrFacultyId(String rollOrFacultyId) {
        this.rollOrFacultyId = rollOrFacultyId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }
}
