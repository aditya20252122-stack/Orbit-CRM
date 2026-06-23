package com.orbit.entity;

import java.time.LocalDateTime;
import java.util.List;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "agent")

@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"manager", "leads"}) // avoid infinite loop

public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column(unique = true)
    private String email;

    @Column
    @JsonProperty(access = Access.WRITE_ONLY)
    private String password;

    @Column
    private String phone;

    @Column
    private Boolean status;

    @Column
    private LocalDateTime date;	
    
    

    // ✅ Many Agents belong to one Manager
    @ManyToOne
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties("agents")
    private Manager manager;
    // ✅ One Agent handles many Leads
    @JsonIgnore
    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    private List<Lead> leads;
}