package com.orbit.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.orbit.entity.FollowUp;
import com.orbit.service.FollowUpService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/followups")
@CrossOrigin("*")
@RequiredArgsConstructor

public class FollowUpController {

    private final FollowUpService followUpService;

    // 🔥 Add Follow-up
    @PostMapping("/{leadId}")
    public FollowUp addFollowUp(@RequestBody FollowUp followUp,
                               @PathVariable Long leadId) {
        return followUpService.addFollowUp(followUp, leadId);
    }

    // 🔥 Get Follow-ups by Lead
    @GetMapping("/{leadId}")
    public List<FollowUp> getFollowUps(@PathVariable Long leadId) {
        return followUpService.getFollowUpsByLead(leadId);
    }
}