package com.orbit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.orbit.entity.FollowUp;

import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {

    List<FollowUp> findByLeadId(Long leadId);
}