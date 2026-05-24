package com.fitcore.profile;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProfileController {

    private final AppUserRepository appUserRepository;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(Principal principal) {
        AppUser user = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ProfileResponse response = new ProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive()
        );

        return ResponseEntity.ok(response);
    }
}