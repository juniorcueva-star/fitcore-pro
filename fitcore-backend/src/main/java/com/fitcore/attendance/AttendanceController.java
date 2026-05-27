package com.fitcore.attendance;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/attendances")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final AppUserRepository appUserRepository;

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponse> checkIn(
            @Valid @RequestBody CheckInRequest request
    ) {
        AppUser student = appUserRepository.findByDni(request.dni().trim())
                .orElseThrow(() -> new RuntimeException("No existe un alumno con ese DNI"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("El DNI ingresado no pertenece a un alumno");
        }

        if (!student.getActive()) {
            throw new RuntimeException("El alumno está inactivo");
        }

        String membershipStatus = calculateMembershipStatus(student);

        if (membershipStatus.equals("VENCIDA") || membershipStatus.equals("SIN_MEMBRESIA")) {
            throw new RuntimeException("El alumno no tiene una membresía activa");
        }

        Attendance attendance = Attendance.builder()
                .student(student)
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);

        return ResponseEntity.ok(toResponse(savedAttendance));
    }

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getAttendances() {
        List<AttendanceResponse> attendances = attendanceRepository
                .findAllWithStudentOrderByCheckInAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(attendances);
    }

    private AttendanceResponse toResponse(Attendance attendance) {
        AppUser student = attendance.getStudent();

        return new AttendanceResponse(
                attendance.getId(),
                student.getId(),
                student.getFullName(),
                student.getDni(),
                student.getPhoneNumber(),
                calculateMembershipStatus(student),
                attendance.getCheckInAt(),
                attendanceRepository.countByStudent(student)
        );
    }

    private String calculateMembershipStatus(AppUser user) {
        if (user.getRole() != Role.STUDENT) {
            return "NO_APLICA";
        }

        if (user.getMembershipPlan() == null || user.getMembershipStartDate() == null) {
            return "SIN_MEMBRESIA";
        }

        if (user.getMembershipEndDate() == null) {
            return "ACTIVA";
        }

        LocalDate today = LocalDate.now();

        if (user.getMembershipEndDate().isBefore(today)) {
            return "VENCIDA";
        }

        if (!user.getMembershipEndDate().isAfter(today.plusDays(5))) {
            return "POR_VENCER";
        }

        return "ACTIVA";
    }
}