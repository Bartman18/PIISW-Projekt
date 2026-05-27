package com.piisw.auth;

import com.piisw.auth.dto.LoginRequest;
import com.piisw.auth.dto.LoginResponse;
import com.piisw.common.exception.InvalidCredentialsException;
import com.piisw.user.User;
import com.piisw.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        String username = request.username().trim().toLowerCase();
        User user = userRepository.findByUsername(username)
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new InvalidCredentialsException("Błędny login lub hasło"));
        String token = jwtUtil.generateToken(user);
        return new LoginResponse(token, user.getUsername(), user.getDisplayName(), user.getRole());
    }
}
