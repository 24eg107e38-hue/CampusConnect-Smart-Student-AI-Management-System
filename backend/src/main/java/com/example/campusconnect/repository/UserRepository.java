package com.example.campusconnect.repository;

import com.example.campusconnect.entity.Role;
import com.example.campusconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    long countByActive(boolean active);
    List<User> findByRole(Role role);
}
