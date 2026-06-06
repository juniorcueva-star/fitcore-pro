package com.fitcore.profile;

import com.fitcore.user.AppUser;
import com.fitcore.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProfilePhotoController {

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final AppUserRepository appUserRepository;

    @PostMapping(
            value = "/photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProfilePhotoResponse> uploadMyProfilePhoto(
            Principal principal,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        AppUser user = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (photo == null || photo.isEmpty()) {
            throw new RuntimeException("Debes seleccionar una imagen en el campo llamado photo");
        }

        if (photo.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("La imagen no debe superar 2MB");
        }

        String contentType = photo.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Solo se permiten imágenes JPG, PNG o WEBP");
        }

        Path uploadDir = Path.of("uploads", "profile-photos")
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(uploadDir);

            String extension = getExtension(contentType);
            String fileName = "user-" + user.getId() + "-" + UUID.randomUUID() + extension;

            Path destination = uploadDir.resolve(fileName);

            Files.copy(photo.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = "/uploads/profile-photos/" + fileName;

            user.setProfilePhotoUrl(photoUrl);

            AppUser updatedUser = appUserRepository.save(user);

            return ResponseEntity.ok(toResponse(updatedUser));
        } catch (Exception exception) {
            exception.printStackTrace();
            throw new RuntimeException("No se pudo guardar la foto de perfil: " + exception.getMessage());
        }
    }

    @DeleteMapping("/photo")
    public ResponseEntity<ProfilePhotoResponse> removeMyProfilePhoto(
            Principal principal
    ) {
        AppUser user = appUserRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setProfilePhotoUrl(null);

        AppUser updatedUser = appUserRepository.save(user);

        return ResponseEntity.ok(toResponse(updatedUser));
    }

    private String getExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new RuntimeException("Formato no permitido");
        };
    }

    private ProfilePhotoResponse toResponse(AppUser user) {
        return new ProfilePhotoResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getProfilePhotoUrl()
);
    }
}