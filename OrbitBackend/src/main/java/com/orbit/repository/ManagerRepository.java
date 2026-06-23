package com.orbit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.orbit.entity.Manager;

import java.util.List;

public interface ManagerRepository extends JpaRepository<Manager, Long> {

    // for login
    Manager findByEmail(String email);
    List<Manager> findByArea(String area);
}