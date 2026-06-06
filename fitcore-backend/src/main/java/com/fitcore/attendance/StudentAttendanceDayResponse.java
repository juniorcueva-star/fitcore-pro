package com.fitcore.attendance;

import java.time.LocalDate;

public record StudentAttendanceDayResponse(
        LocalDate date,
        Boolean attended,
        Boolean futureDay,
        String status
) {
}