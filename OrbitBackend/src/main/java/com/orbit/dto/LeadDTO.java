package com.orbit.dto;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LeadDTO {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String status;

    private String source;

    private String notes;

    private LocalDateTime createdAt;

    private String area;

    // 🔥 Instead of full Manager object, use ID
    private Long managerId;
}