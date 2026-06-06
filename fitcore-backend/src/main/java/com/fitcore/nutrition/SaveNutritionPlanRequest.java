package com.fitcore.nutrition;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SaveNutritionPlanRequest(
        @NotNull(message = "El ID del alumno es obligatorio")
        Long studentId,

        @Size(max = 500, message = "El desayuno no debe superar 500 caracteres")
        String breakfast,

        @Size(max = 500, message = "La merienda de la mañana no debe superar 500 caracteres")
        String morningSnack,

        @Size(max = 500, message = "El almuerzo no debe superar 500 caracteres")
        String lunch,

        @Size(max = 500, message = "La merienda de la tarde no debe superar 500 caracteres")
        String afternoonSnack,

        @Size(max = 500, message = "La cena no debe superar 500 caracteres")
        String dinner
) {
}