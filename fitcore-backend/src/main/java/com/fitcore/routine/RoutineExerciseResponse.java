package com.fitcore.routine;

import java.time.LocalDateTime;

public record RoutineExerciseResponse(
        Long id,
        Long studentId,
        String studentName,
        Long trainerId,
        String trainerName,
        String exerciseName,
        Integer series,
        Integer repetitions,
        Boolean completed,
        LocalDateTime createdAt,
        LocalDateTime completedAt
) {
}