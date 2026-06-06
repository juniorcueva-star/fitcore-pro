package com.fitcore.trainer;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TrainerTestController {

    private final AppUserRepository appUserRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> dashboard(Principal principal) {
        return ResponseEntity.ok(
                Map.of(
                        "message", "Acceso permitido al panel TRAINER",
                        "user", principal.getName()
                )
        );
    }

    @GetMapping("/students")
    public ResponseEntity<List<TrainerStudentResponse>> getMyStudents(
            Principal principal
    ) {
        AppUser trainer = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));

        List<TrainerStudentResponse> students = appUserRepository
                .findByCoachAndRoleOrderByFullNameAsc(trainer, Role.STUDENT)
                .stream()
                .filter(AppUser::getActive)
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(students);
    }

    @PatchMapping("/students/{studentId}/remove")
    public ResponseEntity<Map<String, String>> removeStudentFromCoach(
            Principal principal,
            @PathVariable Long studentId
    ) {
        AppUser trainer = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));

        AppUser student = appUserRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("El usuario seleccionado no es alumno");
        }

        if (student.getCoach() == null || !student.getCoach().getId().equals(trainer.getId())) {
            throw new RuntimeException("Este alumno no pertenece a tu lista");
        }

        student.setCoach(null);
        appUserRepository.save(student);

        return ResponseEntity.ok(
                Map.of("message", "Alumno expulsado correctamente de tu lista")
        );
    }

    private TrainerStudentResponse toResponse(AppUser user) {
    return new TrainerStudentResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getActive(),
            user.getDni(),
            user.getPhoneNumber(),
            calculateMembershipStatus(user),
            user.getFitnessGoal(),
            user.getProfilePhotoUrl()
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