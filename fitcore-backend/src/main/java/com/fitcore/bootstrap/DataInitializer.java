package com.fitcore.bootstrap;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import com.fitcore.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfNotExists(
                "Administrador FitCore",
                "admin@fitcore.com",
                "123456",
                Role.ADMIN
        );

        createUserIfNotExists(
                "Coach Lucía",
                "coach@fitcore.com",
                "123456",
                Role.TRAINER
        );

        createUserIfNotExists(
                "Carlos Mendoza",
                "alumno@fitcore.com",
                "123456",
                Role.STUDENT
        );
    }

    private void createUserIfNotExists(
            String fullName,
            String email,
            String password,
            Role role
    ) {
        boolean userExists = appUserRepository.existsByEmail(email);

        if (userExists) {
            return;
        }

        AppUser user = AppUser.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .active(true)
                .build();

        appUserRepository.save(user);
    }
}