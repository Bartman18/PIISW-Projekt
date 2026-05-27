package com.piisw.auth;

import com.piisw.user.Role;

public record AuthenticatedUser(Long id, String username, Role role) {
}
