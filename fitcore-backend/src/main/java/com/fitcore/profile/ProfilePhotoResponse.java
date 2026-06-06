package com.fitcore.profile;

public record ProfilePhotoResponse(
        Long userId,
        String fullName,
        String email,
        String profilePhotoUrl
) {
}