package com.orbit.service;

import java.util.List;
import com.orbit.entity.Contact;

public interface ContactService {
    List<Contact> getAllContacts();
    Contact saveContact(Contact contact);
    void deleteContact(Long id);
}
