package com.example.campusconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String category; // CERTIFICATION, HACKATHON, SPORTS, PAPER_PRESENTATION, WORKSHOP, COMPETITION

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(name = "achievement_date", nullable = false)
    private LocalDate achievementDate;

    @Column(name = "proof_url", length = 255)
    private String proofUrl;

    @Column(nullable = false)
    private boolean verified = false;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    public Achievement() {}

    public Achievement(Student student, String title, String category, String description, LocalDate achievementDate, String proofUrl) {
        this.student = student;
        this.title = title;
        this.category = category;
        this.description = description;
        this.achievementDate = achievementDate;
        this.proofUrl = proofUrl;
        this.verified = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getAchievementDate() {
        return achievementDate;
    }

    public void setAchievementDate(LocalDate achievementDate) {
        this.achievementDate = achievementDate;
    }

    public String getProofUrl() {
        return proofUrl;
    }

    public void setProofUrl(String proofUrl) {
        this.proofUrl = proofUrl;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }
}
