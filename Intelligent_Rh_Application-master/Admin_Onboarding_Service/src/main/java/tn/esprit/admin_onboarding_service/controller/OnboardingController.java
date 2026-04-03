package tn.esprit.admin_onboarding_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.admin_onboarding_service.DTO.SignatureDTO;
import tn.esprit.admin_onboarding_service.entity.Appointment;
import tn.esprit.admin_onboarding_service.entity.Collaborateur;
import tn.esprit.admin_onboarding_service.service.CalendarService;
import tn.esprit.admin_onboarding_service.service.OnboardingService;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final CalendarService calendarService;

    @PostMapping("/transformer/{id}")
    public ResponseEntity<String> transformerCandidat(
            @PathVariable("id") Long id,
            @RequestParam("metier") String metier,
            @RequestParam("nom") String nom,
            @RequestParam("prenom") String prenom) {

        onboardingService.transformerCandidatEnCollaborateur(id, metier, nom, prenom);
        return ResponseEntity.ok("Candidat transformé avec succès en collaborateur !");
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        try {
            return ResponseEntity.ok(onboardingService.recupererTousLesCollaborateurs());
        } catch (Exception e) {
            e.printStackTrace(); // Cela affichera l'erreur réelle dans ta console Spring
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    @PutMapping("/finaliser/{id}")
    public ResponseEntity<String> finaliserOnboarding(@PathVariable("id") Long id) {
        onboardingService.finaliserOnboarding(id);
        return ResponseEntity.ok("Processus d'onboarding finalisé.");
    }
    @GetMapping("/calendar/{year}/{month}")
    public List<Appointment> getCalendar(@PathVariable int year, @PathVariable int month) {
        LocalDate firstDayOfMonth = LocalDate.of(year, month, 1);
        return calendarService.getAppointmentsByMonth(firstDayOfMonth);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = onboardingService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    @PostMapping("/signature")
    public ResponseEntity<?> saveSignature(@RequestBody SignatureDTO dto) {
        try {
            if (dto.getSignature() == null || dto.getSignature().isBlank()) {
                return ResponseEntity.badRequest().body("Signature manquante");
            }

            byte[] imageBytes = decodeBase64(dto.getSignature());

            Path path = Paths.get("signatures", "OnBoarding_" + dto.getId() + ".png");
            Files.createDirectories(path.getParent());
            Files.write(path, imageBytes);

            return ResponseEntity.ok("Signature enregistrée avec succès");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Format de signature invalide");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'enregistrement de la signature");
        }
    }

    @GetMapping("/signature/{id}")
    public ResponseEntity<?> getSignature(@PathVariable Long id) {
        try {
            Path path = Paths.get("signatures", "OnBoarding_" + id + ".png");

            if (!Files.exists(path)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Signature non trouvée");
            }

            byte[] imageBytes = Files.readAllBytes(path);
            String base64 = Base64.getEncoder().encodeToString(imageBytes);

            return ResponseEntity.ok("data:image/png;base64," + base64);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la lecture de la signature");
        }
    }

    /* ================= QR CODE ================= */

    @PostMapping("/uploadQR")
    public ResponseEntity<Map<String, String>> uploadQRCode(@RequestBody Map<String, String> body) {
        try {
            String imageData = body.get("imageData");
            if (imageData == null || imageData.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "QR Code manquant"));
            }

            byte[] imageBytes = decodeBase64(imageData);

            String fileName = "qr_code_" + System.currentTimeMillis() + ".png";
            Path outputPath = Paths.get("uploads", "qr", fileName);
            Files.createDirectories(outputPath.getParent());
            Files.write(outputPath, imageBytes);

            return ResponseEntity.ok(Map.of(
                    "message", "QR Code enregistré avec succès",
                    "filePath", outputPath.toString()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Format QR Code invalide"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de l'enregistrement du QR Code"));
        }
    }

    /* ================= UTIL ================= */

    private byte[] decodeBase64(String data) {
        // Supprimer le prefix data:image/xxx;base64,
        if (data.contains(",")) {
            data = data.substring(data.indexOf(",") + 1);
        }

        // Nettoyage total
        data = data.replaceAll("\\s+", "");

        return Base64.getDecoder().decode(data);
    }
}