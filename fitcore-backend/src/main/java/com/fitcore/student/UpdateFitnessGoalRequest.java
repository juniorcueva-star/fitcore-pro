package com.fitcore.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateFitnessGoalRequest(
        @NotBlank(message = "El objetivo es obligatorio")
        @Size(max = 200, message = "El objetivo no debe superar 200 caracteres")
        String fitnessGoal
) {
}