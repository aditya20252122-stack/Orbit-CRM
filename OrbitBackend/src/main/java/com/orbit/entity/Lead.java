package com.orbit.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.orbit.enums.LeadStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
@Entity
@Table(name = "leads")
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude="agent")

public class Lead {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long id;
	@Column
	 private String name;
	@Column
	 private String email;
	@Column
	 private String phone;
	@Column
	@Enumerated(EnumType.STRING)
	private LeadStatus status; 
	@Column
	 private String source;
	@Column
	 private String notes;
	@Column
	private LocalDateTime createdAt = LocalDateTime.now();
	@Column
	private String priority;   // HIGH, MEDIUM, LOW
	@Column
	private LocalDateTime assignedDate;
	 @Column
	private String area; 
	@ManyToOne
	@JoinColumn(name = "agent_id")
	@JsonIgnoreProperties({"leads", "manager"})
	private Agent agent;
	
	@ManyToOne
	@JoinColumn(name = "manager_id")
	@JsonIgnoreProperties({"leads", "agents", "admin"})
	private Manager manager;
}
