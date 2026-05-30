package com.fitcore.routine;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/trainer/routines")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TrainerRoutineController {

    private final RoutineExerciseRepository routineExerciseRepository;
    private final AppUserRepository appUserRepository;

    @PostMapping
    public ResponseEntity<RoutineExerciseResponse> createExercise(
            Principal principal,
            @Valid @RequestBody CreateRoutineExerciseRequest request
    ) {
        AppUser trainer = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));

        AppUser student = appUserRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("El usuario seleccionado no es alumno");
        }

        if (student.getCoach() == null || !student.getCoach().getId().equals(trainer.getId())) {
            throw new RuntimeException("Solo puedes asignar rutinas a tus propios alumnos");
        }

        RoutineExercise exercise = RoutineExercise.builder()
                .exerciseName(request.exerciseName().trim())
                .series(request.series())
                .repetitions(request.repetitions())
                .student(student)
                .trainer(trainer)
                .completed(false)
                .build();

        RoutineExercise savedExercise = routineExerciseRepository.save(exercise);

        return ResponseEntity.ok(toResponse(savedExercise));
    }

    @GetMapping
    public ResponseEntity<List<RoutineExerciseResponse>> getMyAssignedExercises(
            Principal principal
    ) {
        AppUser trainer = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));

        List<RoutineExerciseResponse> exercises = routineExerciseRepository
                .findByTrainerOrderByCreatedAtDesc(trainer)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(exercises);
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