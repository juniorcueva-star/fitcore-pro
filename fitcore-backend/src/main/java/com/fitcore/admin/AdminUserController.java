package com.fitcore.admin;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.MembershipPlan;
import com.fitcore.user.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminUserController {

    private static final String MAIN_ADMIN_EMAIL = "admin@fitcore.com";

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

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        AppUser user = findUserById(id);
        return ResponseEntity.ok(toResponse(user));
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

        if (appUserRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Ya existe un usuario con ese correo electrónico");
        }

        validateStudentBusinessRules(
                request.role(),
                request.dni(),
                request.phoneNumber(),
                request.membershipPlan(),
                request.membershipAmount(),
                request.membershipStartDate(),
                null
        );

        if (request.role() == Role.STUDENT && request.dni() != null) {
            if (appUserRepository.existsByDni(request.dni().trim())) {
                throw new RuntimeException("Ya existe un alumno con ese DNI");
            }
        }

        AppUser user = AppUser.builder()
                .fullName(request.fullName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.password().trim()))
                .role(request.role())
                .active(true)
                .dni(normalizeTextOrNull(request.dni()))
                .phoneNumber(normalizeTextOrNull(request.phoneNumber()))
                .membershipPlan(request.role() == Role.STUDENT ? request.membershipPlan() : null)
                .membershipAmount(request.role() == Role.STUDENT ? request.membershipAmount() : null)
                .membershipStartDate(request.role() == Role.STUDENT ? request.membershipStartDate() : null)
                .membershipEndDate(
                        request.role() == Role.STUDENT
                                ? calculateMembershipEndDate(request.membershipPlan(), request.membershipStartDate())
                                : null
                )
                .build();

        AppUser savedUser = appUserRepository.save(user);

        return ResponseEntity.ok(toResponse(savedUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        AppUser user = findUserById(id);

        String normalizedEmail = request.email().trim().toLowerCase();

        if (isMainAdmin(user) && !normalizedEmail.equals(MAIN_ADMIN_EMAIL)) {
            throw new RuntimeException("No puedes cambiar el correo del administrador principal");
        }

        if (isMainAdmin(user) && !request.active()) {
            throw new RuntimeException("No puedes inactivar el administrador principal");
        }

        appUserRepository.findByEmail(normalizedEmail)
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(id)) {
                        throw new RuntimeException("Ya existe otro usuario con ese correo electrónico");
                    }
                });

        validateStudentBusinessRules(
                request.role(),
                request.dni(),
                request.phoneNumber(),
                request.membershipPlan(),
                request.membershipAmount(),
                request.membershipStartDate(),
                id
        );

        if (request.role() == Role.STUDENT && request.dni() != null) {
            appUserRepository.findByDni(request.dni().trim())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(id)) {
                            throw new RuntimeException("Ya existe otro alumno con ese DNI");
                        }
                    });
        }

        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setRole(request.role());
        user.setActive(request.active());

        if (request.role() == Role.STUDENT) {
            user.setDni(normalizeTextOrNull(request.dni()));
            user.setPhoneNumber(normalizeTextOrNull(request.phoneNumber()));
            user.setMembershipPlan(request.membershipPlan());
            user.setMembershipAmount(request.membershipAmount());
            user.setMembershipStartDate(request.membershipStartDate());
            user.setMembershipEndDate(
                    calculateMembershipEndDate(request.membershipPlan(), request.membershipStartDate())
            );
        } else {
            user.setDni(null);
            user.setPhoneNumber(null);
            user.setMembershipPlan(null);
            user.setMembershipAmount(null);
            user.setMembershipStartDate(null);
            user.setMembershipEndDate(null);
        }

        AppUser updatedUser = appUserRepository.save(user);

        return ResponseEntity.ok(toResponse(updatedUser));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<UserResponse> toggleUserActive(@PathVariable Long id) {
        AppUser user = findUserById(id);

        if (isMainAdmin(user)) {
            throw new RuntimeException("No puedes activar o inactivar el administrador principal");
        }

        user.setActive(!user.getActive());

        AppUser updatedUser = appUserRepository.save(user);

        return ResponseEntity.ok(toResponse(updatedUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        AppUser user = findUserById(id);

        if (isMainAdmin(user)) {
            throw new RuntimeException("No puedes eliminar el administrador principal");
        }

        appUserRepository.delete(user);

        return ResponseEntity.noContent().build();
    }

    private void validateStudentBusinessRules(
            Role role,
            String dni,
            String phoneNumber,
            MembershipPlan membershipPlan,
            java.math.BigDecimal membershipAmount,
            LocalDate membershipStartDate,
            Long currentUserId
    ) {
        if (role != Role.STUDENT) {
            return;
        }

        if (dni == null || dni.trim().isBlank()) {
            throw new RuntimeException("El DNI del alumno es obligatorio");
        }

        if (phoneNumber == null || phoneNumber.trim().isBlank()) {
            throw new RuntimeException("El número de celular del alumno es obligatorio");
        }

        if (membershipPlan == null) {
            throw new RuntimeException("El plan de membresía es obligatorio para alumnos");
        }

        if (membershipAmount == null) {
            throw new RuntimeException("El monto pagado es obligatorio para alumnos");
        }

        if (membershipStartDate == null) {
            throw new RuntimeException("La fecha de inicio de membresía es obligatoria para alumnos");
        }
    }

    private LocalDate calculateMembershipEndDate(MembershipPlan plan, LocalDate startDate) {
        if (plan == null || startDate == null) {
            return null;
        }

        return switch (plan) {
            case LIBRE -> null;
            case MENSUAL -> startDate.plusMonths(1);
            case TRIMESTRAL -> startDate.plusMonths(3);
            case SEMESTRAL -> startDate.plusMonths(6);
            case ANUAL -> startDate.plusYears(1);
        };
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

    private AppUser findUserById(Long id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private boolean isMainAdmin(AppUser user) {
        return user.getEmail().equalsIgnoreCase(MAIN_ADMIN_EMAIL);
    }

    private String normalizeTextOrNull(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private UserResponse toResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                user.getDni(),
                user.getPhoneNumber(),
                user.getMembershipPlan(),
                user.getMembershipAmount(),
                user.getMembershipStartDate(),
                user.getMembershipEndDate(),
                calculateMembershipStatus(user),
                user.getCreatedAt()
        );
    }
}