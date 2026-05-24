package com.fitcore.trainer;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainerTestController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> dashboard(Principal principal) {
        return ResponseEntity.ok(
                Map.of(
                        "message", "Acceso permitido al panel TRAINER",
                        "user", principal.getName()
                )
        );
    }
}