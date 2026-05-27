package com.fitcore.admin;

import com.fitcore.user.MembershipPlan;
import com.fitcore.user.Role;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        Boolean active,
        String dni,
        String phoneNumber,
        MembershipPlan membershipPlan,
        BigDecimal membershipAmount,
        LocalDate membershipStartDate,
        LocalDate membershipEndDate,
        String membershipStatus,
        LocalDateTime createdAt
) {
}