package com.fitcore.routine;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateRoutineExerciseRequest(
        @NotNull(message = "El ID del alumno es obligatorio")
        Long studentId,

        @NotBlank(message = "El nombre del ejercicio es obligatorio")
        @Size(min = 3, max = 160, message = "El ejercicio debe tener entre 3 y 160 caracteres")
        String exerciseName,

        @NotNull(message = "Las series son obligatorias")
        @Min(value = 1, message = "Debe tener al menos 1 serie")
        Integer series,

        @NotNull(message = "Las repeticiones son obligatorias")
        @Min(value = 1, message = "Debe tener al menos 1 repetición")
        Integer repetitions
) {
}