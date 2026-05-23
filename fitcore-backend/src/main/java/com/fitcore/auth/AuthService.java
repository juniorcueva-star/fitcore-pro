package com.fitcore.auth;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        if (!user.getActive()) {
            throw new RuntimeException("El usuario se encuentra inactivo");
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}