package com.fitcore.nutrition;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/student/nutrition")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class StudentNutritionController {

    private final NutritionPlanRepository nutritionPlanRepository;
    private final AppUserRepository appUserRepository;

    @GetMapping
    public ResponseEntity<List<NutritionPlanResponse>> getMyNutritionPlans(
            Principal principal
    ) {
        AppUser student = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        List<NutritionPlanResponse> plans = nutritionPlanRepository
                .findByStudentOrderByUpdatedAtDesc(student)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(plans);
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
