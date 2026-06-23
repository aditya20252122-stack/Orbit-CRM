package com.orbit.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.orbit.entity.Contact;
import com.orbit.service.ContactService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    public List<Contact> getAllContacts() {
        return contactService.getAllContacts();
    }

    @PostMapping
    public Contact createContact(@RequestBody Contact contact) {
        return contactService.saveContact(contact);
    }

    @DeleteMapping("/{id}")
    public String deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return "Contact deleted successfully";
    }
}
