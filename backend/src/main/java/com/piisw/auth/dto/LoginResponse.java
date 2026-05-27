package com.piisw.auth.dto;

import com.piisw.user.Role;

public record LoginResponse(
        String token,
        String username,
        String displayName,
        Role role) {
}
