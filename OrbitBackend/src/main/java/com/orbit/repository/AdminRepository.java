package com.orbit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.orbit.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Admin findByEmail(String email);
}