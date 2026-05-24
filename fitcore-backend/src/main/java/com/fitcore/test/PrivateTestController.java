package com.fitcore.test;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/private")
@CrossOrigin(origins = "http://localhost:5173")
public class PrivateTestController {

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping(Principal principal) {
        return ResponseEntity.ok(
                Map.of(
                        "message", "Acceso autorizado con JWT",
                        "user", principal.getName()
                )
        );
    }
}