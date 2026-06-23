package com.orbit.serviceImpl;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.orbit.entity.Admin;
import com.orbit.entity.Manager;
import com.orbit.entity.Agent;
import com.orbit.entity.Lead;
import com.orbit.repository.AdminRepository;
import com.orbit.repository.ManagerRepository;
import com.orbit.repository.AgentRepository;
import com.orbit.repository.LeadRepository;
import com.orbit.service.ManagerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManagerServiceImpl implements ManagerService {

    private final ManagerRepository managerRepository;
    private final AdminRepository adminRepository; 
    private final AgentRepository agentRepository;
    private final LeadRepository leadRepository;
    private final BCryptPasswordEncoder passwordEncoder; // 🔐 Password hashing

    @Override
    public Manager saveManager(Manager manager) {

        // 🔐 Encrypt password before saving
        if (manager.getPassword() != null && !manager.getPassword().isEmpty()) {
            manager.setPassword(passwordEncoder.encode(manager.getPassword()));
        }

        // 🔥 FIX: Handle admin properly
        if (manager.getAdmin() != null && manager.getAdmin().getId() != null) {

            Admin admin = adminRepository.findById(manager.getAdmin().getId())
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            manager.setAdmin(admin);
        } else {
            manager.setAdmin(null);
        }

        return managerRepository.save(manager);
    }

    @Override
    public List<Manager> getAllManagers() {
        return managerRepository.findAll();
    }

    @Override
    public Manager getManagerById(Long id) {
        return managerRepository.findById(id).orElse(null);
    }

    @Override
    public Manager updateManager(Long id, Manager manager) {

        Manager existing = managerRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setName(manager.getName());
            existing.setEmail(manager.getEmail());
            existing.setPhone(manager.getPhone());
            existing.setStatus(manager.getStatus());
            existing.setArea(manager.getArea()); // Save updated area

            // 🔐 Only update password if a new one is provided
            if (manager.getPassword() != null && !manager.getPassword().isEmpty()) {
                existing.setPassword(passwordEncoder.encode(manager.getPassword()));
            }

            // 🔥 also update admin safely
            if (manager.getAdmin() != null && manager.getAdmin().getId() != null) {
                Admin admin = adminRepository.findById(manager.getAdmin().getId())
                        .orElseThrow(() -> new RuntimeException("Admin not found"));
                existing.setAdmin(admin);
            }

            return managerRepository.save(existing);
        }

        return null;
    }

    @Override
    public void deleteManager(Long id) {
        // Find agents assigned to this manager and set manager to null
        List<Agent> agents = agentRepository.findByManagerId(id);
        if (agents != null) {
            for (Agent agent : agents) {
                agent.setManager(null);
                agentRepository.save(agent);
            }
        }

        // Find leads assigned to this manager and set manager to null
        List<Lead> leads = leadRepository.findByManagerId(id);
        if (leads != null) {
            for (Lead lead : leads) {
                lead.setManager(null);
                leadRepository.save(lead);
            }
        }

        managerRepository.deleteById(id);
    }

    @Override
    public Manager getManagerByEmail(String email) {
        return managerRepository.findByEmail(email);
    }
}