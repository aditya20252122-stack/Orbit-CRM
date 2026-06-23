package com.orbit.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;

        String authHeader = req.getHeader("Authorization");

        // 🔐 Basic validation (you can extend later)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            @SuppressWarnings("unused")
			String token = authHeader.substring(7);
            // validate token if needed
        }

        chain.doFilter(request, response);
    }
}