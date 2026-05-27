package com.fitcore.trainer;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Comparator;
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
    public ResponseEntity<List<TrainerStudentResponse>> getStudents() {
        List<TrainerStudentResponse> students = appUserRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.STUDENT)
                .filter(AppUser::getActive)
                .sorted(Comparator.comparing(AppUser::getId))
                .map(user -> new TrainerStudentResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getActive(),
                        "Hipertrofia"
                ))
                .toList();

        return ResponseEntity.ok(students);
    }
}