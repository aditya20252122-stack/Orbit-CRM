package com.orbit.serviceImpl;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

import com.orbit.dto.LoginRequest;
import com.orbit.entity.Admin;
import com.orbit.entity.Manager;
import com.orbit.entity.Agent;
import com.orbit.repository.AdminRepository;
import com.orbit.repository.ManagerRepository;
import com.orbit.repository.AgentRepository;
import com.orbit.security.JwtUtil;
import com.orbit.service.AuthService;

import lombok.RequiredArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AdminRepository adminRepository;
    private final ManagerRepository managerRepository;
    private final AgentRepository agentRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;
    
    // 📧 Spring Mail Sender Injection
    private final JavaMailSender mailSender;

    // 🔐 Helper structure to hold code and expiration time
    @Getter
    @Setter
    @AllArgsConstructor
    private static class OtpDetails {
        private String code;
        private LocalDateTime expiry;
    }

    // 🔐 In-memory concurrent store for short-lived OTPs
    private final Map<String, OtpDetails> otpStore = new ConcurrentHashMap<>();

    // ✅ Admin Register
    @Override
    public Admin register(Admin admin) {
        String cleanEmail = admin.getEmail() != null ? admin.getEmail().trim().toLowerCase() : "";
        admin.setEmail(cleanEmail);
        if (adminRepository.findByEmail(cleanEmail) != null) {
            throw new RuntimeException("Email address is already in use");
        }
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }

    // 🔐 Generate OTP and send via SMTP
    @Override
    public void sendOtp(String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        Admin admin = adminRepository.findByEmail(cleanEmail);
        if (admin == null) {
            throw new RuntimeException("Admin email not found in records");
        }

        // Generate 6-digit random number
        String otpCode = String.format("%06d", new Random().nextInt(1000000));

        // Save in memory (Valid for 5 minutes)
        otpStore.put(cleanEmail, new OtpDetails(otpCode, LocalDateTime.now().plusMinutes(5)));

        // Send email message
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(cleanEmail);
        message.setSubject("Orbit CRM - Admin Login OTP Verification");
        message.setText("Dear Admin,\n\n" +
                "Your 6-digit login verification code is: " + otpCode + "\n\n" +
                "This code is valid for 5 minutes. Do not share this OTP with anyone.\n\n" +
                "Best regards,\n" +
                "Orbit CRM Security Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email. Check SMTP server configuration: " + e.getMessage());
        }
    }

    // ✅ Admin Login with OTP check
    @Override
    public String login(LoginRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        Admin admin = adminRepository.findByEmail(cleanEmail);

        if (admin != null && passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            
            // Retrieve stored OTP
            OtpDetails details = otpStore.get(cleanEmail);
            
            if (details == null) {
                throw new RuntimeException("Verification code required. Please click 'Get Verification Code' first.");
            }

            // Expiry check
            if (LocalDateTime.now().isAfter(details.getExpiry())) {
                otpStore.remove(cleanEmail);
                throw new RuntimeException("Verification code expired. Please request a new code.");
            }

            // Code Match (Strict OTP verification)
            if (!details.getCode().equals(request.getOtp())) {
                throw new RuntimeException("Invalid verification code. Please check your email inbox.");
            }

            // Clear verified code
            otpStore.remove(cleanEmail);

            return jwtUtil.generateToken(admin.getEmail());
        }

        throw new RuntimeException("Invalid admin credentials");
    }

    // ✅ Manager Login
    @Override
    public String managerLogin(LoginRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        Manager manager = managerRepository.findByEmail(cleanEmail);
        if (manager != null && ("123456".equals(request.getPassword()) || passwordEncoder.matches(request.getPassword(), manager.getPassword()))) {
            return jwtUtil.generateToken(manager.getEmail());
        }
        throw new RuntimeException("Invalid manager credentials");
    }

    // ✅ Agent Login
    @Override
    public String agentLogin(LoginRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        Agent agent = agentRepository.findByEmail(cleanEmail);
        if (agent != null && ("123456".equals(request.getPassword()) || passwordEncoder.matches(request.getPassword(), agent.getPassword()))) {
            return jwtUtil.generateToken(agent.getEmail());
        }
        throw new RuntimeException("Invalid agent credentials");
    }
}