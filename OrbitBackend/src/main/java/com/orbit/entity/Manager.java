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
@Table(name = "manager")

@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"admin", "agents"}) // avoid recursion

public class Manager {

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
    
    @Column
    private String area; 

    // Many Managers belong to one Admin
    @ManyToOne
    @JoinColumn(name = "admin_id")
    @JsonIgnoreProperties("manager")
    private Admin admin;

    // One Manager has many Agents
    @JsonIgnore
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private List<Agent> agents;
}