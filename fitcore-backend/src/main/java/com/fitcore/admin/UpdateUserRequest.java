package com.fitcore.admin;

import com.fitcore.user.MembershipPlan;
import com.fitcore.user.Role;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateUserRequest(
        @NotBlank(message = "El nombre completo es obligatorio")
        @Size(min = 3, max = 120, message = "El nombre debe tener entre 3 y 120 caracteres")
        String fullName,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El correo electrónico no tiene un formato válido")
        String email,

        @NotNull(message = "El rol es obligatorio")
        Role role,

        @NotNull(message = "El estado activo es obligatorio")
        Boolean active,

        @Pattern(regexp = "^\\d{8}$", message = "El DNI debe tener exactamente 8 dígitos")
        String dni,

        @Pattern(regexp = "^\\d{9}$", message = "El número de celular debe tener exactamente 9 dígitos")
        String phoneNumber,

        @Size(max = 200, message = "El objetivo no debe superar 200 caracteres")
        String fitnessGoal,

        MembershipPlan membershipPlan,

        @DecimalMin(value = "0.0", inclusive = false, message = "El monto debe ser mayor a 0")
        BigDecimal membershipAmount,

        LocalDate membershipStartDate,

        Long coachId
) {
}