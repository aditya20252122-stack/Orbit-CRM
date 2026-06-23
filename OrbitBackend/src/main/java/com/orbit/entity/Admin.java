package com.orbit.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
@Entity
@Table(name = "admin")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "manager")
public class Admin {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
@Column 
private String name;
@Column(unique = true) 
private String email;
@Column 
private String password;
@Column 
private String role;
@Column 
private String phone;
@Column 
private Boolean status;
@Column
private LocalDateTime date = LocalDateTime.now();
    @JsonIgnore
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL)
    private List<Manager> manager;

}
