package com.orbit.controller;

import org.springframework.web.bind.annotation.*;

import com.orbit.dto.AuthResponse;
import com.orbit.dto.LoginRequest;
import com.orbit.entity.Admin;
import com.orbit.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
@RequiredArgsConstructor

public class AuthController {

    private final AuthService authService;

    // 👑 Register Admin
    @PostMapping("/register")
    public Admin register(@RequestBody Admin admin) {
        return authService.register(admin);
    }
 // 🔐 Request Admin OTP
    @PostMapping("/admin/send-otp")
    public void sendOtp(@RequestBody LoginRequest request) {
        authService.sendOtp(request.getEmail());
    }

    // 👑 Admin Login
    @PostMapping("/admin/login")
    public AuthResponse adminLogin(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        return new AuthResponse(token);
    }

    // 🧑‍💼 Manager Login
    @PostMapping("/manager/login")
    public AuthResponse managerLogin(@RequestBody LoginRequest request) {
        String token = authService.managerLogin(request);
        return new AuthResponse(token);
    }

    // 👨‍💻 Agent Login
    @PostMapping("/agent/login")
    public AuthResponse agentLogin(@RequestBody LoginRequest request) {
        String token = authService.agentLogin(request);
        return new AuthResponse(token);
    }
}