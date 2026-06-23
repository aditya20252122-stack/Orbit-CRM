package com.orbit.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.orbit.entity.FollowUp;
import com.orbit.entity.Lead;
import com.orbit.repository.FollowUpRepository;
import com.orbit.repository.LeadRepository;
import com.orbit.service.FollowUpService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class FollowUpServiceImpl implements FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final LeadRepository leadRepository;

    @Override
    public FollowUp addFollowUp(FollowUp followUp, Long leadId) {

        Lead lead = leadRepository.findById(leadId).orElse(null);

        if (lead != null) {
            followUp.setLead(lead);
            followUp.setCreatedAt(LocalDateTime.now());
            return followUpRepository.save(followUp);
        }

        throw new RuntimeException("Lead not found");
    }

    @Override
    public List<FollowUp> getFollowUpsByLead(Long leadId) {
        return followUpRepository.findByLeadId(leadId);
    }
}