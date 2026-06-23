package com.orbit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.orbit.entity.Lead;
import com.orbit.enums.LeadStatus;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {

	List<Lead> findByStatus(LeadStatus status);

    List<Lead> findByAgentId(Long agentId);

    List<Lead> findByManagerId(Long managerId);

    @org.springframework.data.jpa.repository.Query("SELECT l FROM Lead l WHERE l.manager.id = :managerId OR (l.area = :area AND l.area IS NOT NULL AND l.area != '')")
    List<Lead> findByManagerIdOrArea(@org.springframework.data.repository.query.Param("managerId") Long managerId, @org.springframework.data.repository.query.Param("area") String area);
}