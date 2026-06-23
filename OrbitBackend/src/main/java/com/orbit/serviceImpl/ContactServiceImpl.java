package com.orbit.serviceImpl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.orbit.entity.Contact;
import com.orbit.repository.ContactRepository;
import com.orbit.service.ContactService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    @Override
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    @Override
    public Contact saveContact(Contact contact) {
        return contactRepository.save(contact);
    }

    @Override
    public void deleteContact(Long id) {
        contactRepository.deleteById(id);
    }
}
