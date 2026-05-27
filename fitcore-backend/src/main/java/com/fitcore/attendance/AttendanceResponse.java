package com.fitcore.attendance;

import java.time.LocalDateTime;

public record AttendanceResponse(
        Long id,
        Long studentId,
        String studentName,
        String dni,
        String phoneNumber,
        String membershipStatus,
        LocalDateTime checkInAt,
        Long totalAttendances
) {
}