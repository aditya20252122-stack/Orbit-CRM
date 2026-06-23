package com.orbit.mapper;

import com.orbit.dto.LeadDTO;
import com.orbit.entity.Lead;

public class LeadMapper {

    // 🔄 Entity → DTO
    public static LeadDTO toDTO(Lead lead) {

        LeadDTO dto = new LeadDTO();

        dto.setId(lead.getId());
        dto.setName(lead.getName());
        dto.setEmail(lead.getEmail());
        dto.setPhone(lead.getPhone());
        dto.setStatus(lead.getStatus().name());
        dto.setSource(lead.getSource());
        dto.setNotes(lead.getNotes());
        dto.setCreatedAt(lead.getCreatedAt());
        dto.setArea(lead.getArea());

        if (lead.getAgent() != null) {
            dto.setManagerId(lead.getAgent().getId()); // ⚠️ or agentId (better naming)
        }

        return dto;
    }

    // 🔄 DTO → Entity
    public static Lead toEntity(LeadDTO dto) {

        Lead lead = new Lead();

        lead.setId(dto.getId());
        lead.setName(dto.getName());
        lead.setEmail(dto.getEmail());
        lead.setPhone(dto.getPhone());
        lead.setStatus(
            dto.getStatus() != null
                ? Enum.valueOf(com.orbit.enums.LeadStatus.class, dto.getStatus())
                : null
        );
        lead.setSource(dto.getSource());
        lead.setNotes(dto.getNotes());
        lead.setCreatedAt(dto.getCreatedAt());
        lead.setArea(dto.getArea());

        return lead;
    }
}