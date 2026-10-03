package com.example.campusconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "students", uniqueConstraints = {
    @UniqueConstraint(columnNames = "student_id")
})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @NotBlank
    @Column(name = "student_id", nullable = false, unique = true, length = 50)
    private String studentId;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String course; // e.g. B.Tech Computer Science

    @Column(nullable = false)
    private int year = 1; // 1 to 4

    @Column(nullable = false)
    private int semester = 1; // 1 to 8

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining = LocalDate.now();

    @Column(name = "profile_photo", length = 255)
    private String profilePhoto;

    @Column(length = 255)
    private String address;

    public Student() {}

    public Student(User user, String studentId, Department department, String course, int year, LocalDate dateOfJoining) {
        this.user = user;
        this.studentId = studentId;
        this.department = department;
        this.course = course;
        this.year = year;
        this.semester = year * 2 - 1;
        this.dateOfJoining = dateOfJoining != null ? dateOfJoining : LocalDate.now();
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

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public LocalDate getDateOfJoining() {
        return dateOfJoining;
    }

    public void setDateOfJoining(LocalDate dateOfJoining) {
        this.dateOfJoining = dateOfJoining;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
