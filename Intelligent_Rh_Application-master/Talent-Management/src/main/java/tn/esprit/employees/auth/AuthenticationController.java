package tn.esprit.employees.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.employees.entity.Speciality;
import jakarta.mail.MessagingException;
import java.io.IOException;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegistrationRequest request)
            throws MessagingException {

        service.register(request);

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "status", "success"
        ));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @Transactional
    @GetMapping("/activate")
    public ResponseEntity<String> activateAccount(@RequestParam String token) {
        service.activateAccount(token);
        return ResponseEntity.ok("Account activated successfully!");
    }


    @GetMapping("/specialities")
    public ResponseEntity<Speciality[]> getSpecialities() {
        return ResponseEntity.ok(Speciality.values());
    }

    @PostMapping("/refresh-token")
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        service.refreshToken(request, response);
    }

    @PostMapping("/reset-password-request")
    public ResponseEntity<?> requestReset(@RequestBody PasswordResetRequest request) throws MessagingException {
        service.requestPasswordReset(request.email());
        return ResponseEntity.ok("Reset password email sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token,
                                           @RequestParam String newPassword) {
        try {
            service.resetPassword(token, newPassword);
            return ResponseEntity.ok( Map.of("message", "Mot de passe réinitialisé avec succès"));
        } catch (ResponseStatusException e) {
            // Renvoie un JSON propre avec le message
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", Objects.requireNonNull ( e.getReason () ) ));
        }
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        service.logout(request, response, authentication);
        response.setStatus(HttpServletResponse.SC_OK);
    }
}
