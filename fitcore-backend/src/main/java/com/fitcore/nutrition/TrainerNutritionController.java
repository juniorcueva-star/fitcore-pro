package com.fitcore.nutrition;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/trainer/nutrition")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TrainerNutritionController {

    private final NutritionPlanRepository nutritionPlanRepository;
    private final AppUserRepository appUserRepository;

    @GetMapping
    public ResponseEntity<List<NutritionPlanResponse>> getMyNutritionPlans(
            Principal principal
    ) {
        AppUser trainer = getTrainer(principal);

        List<NutritionPlanResponse> plans = nutritionPlanRepository
                .findByTrainerOrderByUpdatedAtDesc(trainer)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(plans);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<NutritionPlanResponse> saveNutritionPlan(
            Principal principal,
            @Valid @RequestBody SaveNutritionPlanRequest request
    ) {
        AppUser trainer = getTrainer(principal);

        AppUser student = appUserRepository.findByIdWithCoach(request.studentId())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("El usuario seleccionado no es alumno");
        }

        if (student.getCoach() == null || !student.getCoach().getId().equals(trainer.getId())) {
            throw new RuntimeException("Solo puedes crear alimentación para tus propios alumnos");
        }

        List<NutritionPlan> existingPlans = nutritionPlanRepository
                .findAllByStudentAndTrainerOrderByUpdatedAtDesc(student, trainer);

        NutritionPlan nutritionPlan = existingPlans.isEmpty()
                ? NutritionPlan.builder()
                        .student(student)
                        .trainer(trainer)
                        .build()
                : existingPlans.get(0);

        nutritionPlan.setBreakfast(normalizeTextOrNull(request.breakfast()));
        nutritionPlan.setMorningSnack(normalizeTextOrNull(request.morningSnack()));
        nutritionPlan.setLunch(normalizeTextOrNull(request.lunch()));
        nutritionPlan.setAfternoonSnack(normalizeTextOrNull(request.afternoonSnack()));
        nutritionPlan.setDinner(normalizeTextOrNull(request.dinner()));

        NutritionPlan savedPlan = nutritionPlanRepository.save(nutritionPlan);

        return ResponseEntity.ok(toResponse(savedPlan));
    }

    private AppUser getTrainer(Principal principal) {
        return appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
    }

    private String normalizeTextOrNull(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        if (normalized.isBlank()) {
            return null;
        }

        return normalized;
    }

    private NutritionPlanResponse toResponse(NutritionPlan nutritionPlan) {
        return new NutritionPlanResponse(
                nutritionPlan.getId(),
                nutritionPlan.getStudent().getId(),
                nutritionPlan.getStudent().getFullName(),
                nutritionPlan.getTrainer().getId(),
                nutritionPlan.getTrainer().getFullName(),
                nutritionPlan.getBreakfast(),
                nutritionPlan.getMorningSnack(),
                nutritionPlan.getLunch(),
                nutritionPlan.getAfternoonSnack(),
                nutritionPlan.getDinner(),
                nutritionPlan.getCreatedAt(),
                nutritionPlan.getUpdatedAt()
        );
    }
}