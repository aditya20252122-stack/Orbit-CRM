package com.orbit.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "followup")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "lead")

public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String notes;

    private String response;

    @Column(name = "next_followup_date")
    private LocalDateTime nextFollowUpDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 🔥 Link with Lead
    @ManyToOne
    @JoinColumn(name = "lead_id")
    private Lead lead;
}