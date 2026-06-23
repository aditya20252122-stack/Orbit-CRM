package com.orbit.service;

import com.orbit.dto.LoginRequest;
import com.orbit.entity.Admin;

public interface AuthService {

    // 👑 Admin
    Admin register(Admin admin);
    void sendOtp(String email);                  // 🔐 Request OTP
    String login(LoginRequest request);          // 👑 Admin Login

    // 🧑‍💼 Manager
    String managerLogin(LoginRequest request);

    // 👨‍💻 Agent
    String agentLogin(LoginRequest request);
}