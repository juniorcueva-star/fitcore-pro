package com.fitcore.routine;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/student/routines")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class StudentRoutineController {

    private final RoutineExerciseRepository routineExerciseRepository;
    private final AppUserRepository appUserRepository;

    @GetMapping
    public ResponseEntity<List<RoutineExerciseResponse>> getMyRoutines(
            Principal principal
    ) {
        AppUser student = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        List<RoutineExerciseResponse> routines = routineExerciseRepository
                .findByStudentOrderByCreatedAtDesc(student)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(routines);
    }

    @PatchMapping("/{id}/toggle-completed")
    @Transactional
    public ResponseEntity<RoutineExerciseResponse> toggleCompleted(
            Principal principal,
            @PathVariable Long id
    ) {
        AppUser student = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        RoutineExercise exercise = routineExerciseRepository.findByIdWithStudentAndTrainer(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        if (!exercise.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("No puedes modificar una rutina que no te pertenece");
        }

        Boolean newCompletedStatus = !exercise.getCompleted();

        exercise.setCompleted(newCompletedStatus);
        exercise.setCompletedAt(newCompletedStatus ? LocalDateTime.now() : null);

        RoutineExercise updatedExercise = routineExerciseRepository.save(exercise);

        return ResponseEntity.ok(toResponse(updatedExercise));
    }

    private RoutineExerciseResponse toResponse(RoutineExercise exercise) {
        return new RoutineExerciseResponse(
                exercise.getId(),
                exercise.getStudent().getId(),
                exercise.getStudent().getFullName(),
                exercise.getTrainer().getId(),
                exercise.getTrainer().getFullName(),
                exercise.getExerciseName(),
                exercise.getSeries(),
                exercise.getRepetitions(),
                exercise.getCompleted(),
                exercise.getCreatedAt(),
                exercise.getCompletedAt()
        );
    }
}