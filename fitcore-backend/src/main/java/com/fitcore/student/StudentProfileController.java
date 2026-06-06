package com.fitcore.student;

import com.fitcore.admin.UserResponse;
import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/student/profile")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class StudentProfileController {

    private final AppUserRepository appUserRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<UserResponse> getMyStudentProfile(Principal principal) {
        AppUser student = getStudent(principal);
        return ResponseEntity.ok(toResponse(student));
    }

    @PatchMapping("/goal")
    @Transactional
    public ResponseEntity<UserResponse> updateFitnessGoal(
            Principal principal,
            @Valid @RequestBody UpdateFitnessGoalRequest request
    ) {
        AppUser student = getStudent(principal);

        student.setFitnessGoal(request.fitnessGoal().trim());

        AppUser updatedStudent = appUserRepository.save(student);

        return ResponseEntity.ok(toResponse(updatedStudent));
    }

    private AppUser getStudent(Principal principal) {
        AppUser student = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Solo los alumnos pueden acceder a este perfil");
        }

        return student;
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

    private UserResponse toResponse(AppUser user) {
        AppUser coach = user.getCoach();

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                user.getDni(),
                user.getPhoneNumber(),
                user.getFitnessGoal(),
                user.getProfilePhotoUrl(),
                user.getMembershipPlan(),
                user.getMembershipAmount(),
                user.getMembershipStartDate(),
                user.getMembershipEndDate(),
                calculateMembershipStatus(user),
                coach != null ? coach.getId() : null,
                coach != null ? coach.getFullName() : null,
                user.getCreatedAt()
        );
    }
}
