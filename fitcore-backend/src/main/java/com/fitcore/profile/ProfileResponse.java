package com.fitcore.profile;

import com.fitcore.user.Role;

public record ProfileResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        Boolean active
) {
}