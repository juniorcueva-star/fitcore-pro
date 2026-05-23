package com.fitcore.auth;

import com.fitcore.user.Role;

public record AuthResponse(
        Long id,
        String fullName,
        String email,
        Role role
) {
}