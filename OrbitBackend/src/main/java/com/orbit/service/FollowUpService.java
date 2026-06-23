package com.orbit.service;

import java.util.List;
import com.orbit.entity.FollowUp;

public interface FollowUpService {

    FollowUp addFollowUp(FollowUp followUp, Long leadId);

    List<FollowUp> getFollowUpsByLead(Long leadId);
}