package com.fitcore.nutrition;

import java.time.LocalDateTime;

public record NutritionPlanResponse(
        Long id,
        Long studentId,
        String studentName,
        Long trainerId,
        String trainerName,
        String breakfast,
        String morningSnack,
        String lunch,
        String afternoonSnack,
        String dinner,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}