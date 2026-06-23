package com.orbit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.orbit.entity.Contact;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}
