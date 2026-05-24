package com.fitcore.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminTestController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> dashboard(Principal principal) {
        return ResponseEntity.ok(
                Map.of(
                        "message", "Acceso permitido al panel ADMIN",
                        "user", principal.getName()
                )
        );
    }
}