package com.fitcore.admin;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminUserController {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = appUserRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(AppUser::getId))
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/students")
    public ResponseEntity<List<UserResponse>> getStudents() {
        List<UserResponse> students = appUserRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.STUDENT)
                .sorted(Comparator.comparing(AppUser::getId))
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(students);
    }

    @GetMapping("/trainers")
    public ResponseEntity<List<UserResponse>> getTrainers() {
        List<UserResponse> trainers = appUserRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.TRAINER)
                .sorted(Comparator.comparing(AppUser::getId))
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(trainers);
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        String normalizedEmail = request.email().trim().toLowerCase();

        boolean emailExists = appUserRepository.existsByEmail(normalizedEmail);

        if (emailExists) {
            throw new RuntimeException("Ya existe un usuario con ese correo electrónico");
        }

        AppUser user = AppUser.builder()
                .fullName(request.fullName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .active(true)
                .build();

        AppUser savedUser = appUserRepository.save(user);

        return ResponseEntity.ok(toResponse(savedUser));
    }

    private UserResponse toResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                user.getCreatedAt()
        );
    }
}