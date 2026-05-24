package com.fitcore.admin;

import com.fitcore.user.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        Boolean active,
        LocalDateTime createdAt
) {
}