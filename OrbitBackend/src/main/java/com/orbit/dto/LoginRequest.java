package com.orbit.dto;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
    private String otp; // 🔐 Added to receive the 6-digit OTP code
}