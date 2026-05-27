package com.fitcore.trainer;

public record TrainerStudentResponse(
        Long id,
        String fullName,
        String email,
        Boolean active,
        String goal
) {
}