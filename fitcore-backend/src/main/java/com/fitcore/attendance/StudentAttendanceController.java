package com.fitcore.attendance;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/student/attendances")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class StudentAttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final AppUserRepository appUserRepository;

    @GetMapping("/month")
    public ResponseEntity<List<StudentAttendanceDayResponse>> getMyMonthlyAttendances(
            Principal principal,
            @RequestParam Integer year,
            @RequestParam Integer month
    ) {
        AppUser student = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Solo los alumnos pueden ver su calendario de asistencia");
        }

        if (month < 1 || month > 12) {
            throw new RuntimeException("El mes debe estar entre 1 y 12");
        }

        YearMonth selectedMonth = YearMonth.of(year, month);
        LocalDate startDate = selectedMonth.atDay(1);
        LocalDate endDate = selectedMonth.atEndOfMonth();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay().minusNanos(1);

        List<Attendance> attendances = attendanceRepository
                .findByStudentAndCheckInAtBetweenOrderByCheckInAtAsc(
                        student,
                        startDateTime,
                        endDateTime
                );

        Set<LocalDate> attendedDates = new HashSet<>();

        for (Attendance attendance : attendances) {
            attendedDates.add(attendance.getCheckInAt().toLocalDate());
        }

        LocalDate today = LocalDate.now();

        List<StudentAttendanceDayResponse> calendarDays = startDate
                .datesUntil(endDate.plusDays(1))
                .map(date -> {
                    boolean futureDay = date.isAfter(today);
                    boolean attended = attendedDates.contains(date);

                    String status;

                    if (futureDay) {
                        status = "FUTURO";
                    } else if (attended) {
                        status = "ASISTIO";
                    } else {
                        status = "NO_ASISTIO";
                    }

                    return new StudentAttendanceDayResponse(
                            date,
                            attended,
                            futureDay,
                            status
                    );
                })
                .toList();

        return ResponseEntity.ok(calendarDays);
    }
}