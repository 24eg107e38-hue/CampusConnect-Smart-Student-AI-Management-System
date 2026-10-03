package com.example.campusconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "faculty", uniqueConstraints = {
    @UniqueConstraint(columnNames = "faculty_id")
})
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @NotBlank
    @Column(name = "faculty_id", nullable = false, unique = true, length = 50)
    private String facultyId;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String designation; // e.g. Assistant Professor

    @Column(length = 100)
    private String qualification; // e.g. Ph.D, M.Tech

    @Column(length = 150)
    private String specialization;

    public Faculty() {}

    public Faculty(User user, String facultyId, Department department, String designation, String qualification, String specialization) {
        this.user = user;
        this.facultyId = facultyId;
        this.department = department;
        this.designation = designation;
        this.qualification = qualification;
        this.specialization = specialization;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
}
