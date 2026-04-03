package tn.esprit.scoutisme.Controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.scoutisme.DTO.CandidatDTO;
import tn.esprit.scoutisme.client.CandidatClient;
import tn.esprit.scoutisme.entity.TalentComparison;
import tn.esprit.scoutisme.entity.TalentProfile;
import tn.esprit.scoutisme.service.ComparisonService;
import tn.esprit.scoutisme.service.TalentProfileService;

import java.io.File;
import java.util.*;

@RestController
@RequestMapping("/api/scouting")
@RequiredArgsConstructor
@Slf4j
public class ScoutingController {

    private final TalentProfileService talentProfileService;
    private final ComparisonService comparisonService;
    private final CandidatClient candidatClient;

    // ────────────────────────────────────────────────
    // 1️⃣ CREATION / UPDATE PROFIL VIA NOM + PRENOM
    // ────────────────────────────────────────────────

    @PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Créer ou mettre à jour profil talent via nom + prénom")
    public ResponseEntity<?> createOrUpdateProfile(
            @RequestParam String prenom,
            @RequestParam String nom,
            @RequestPart(value = "cv", required = false) MultipartFile cvFile) {

        File tempFile = null;

        try {

            if (cvFile != null && !cvFile.isEmpty()) {
                tempFile = File.createTempFile("cv_", ".pdf");
                cvFile.transferTo(tempFile);
            }

            TalentProfile profile =
                    talentProfileService.createOrUpdateProfileFromCandidat(
                            prenom,
                            nom,
                            tempFile
                    );

            return ResponseEntity.ok(profile);

        } catch (IllegalArgumentException e) {
            log.warn("Candidat introuvable: {} {}", prenom, nom);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Candidat introuvable");

        } catch (Exception e) {
            log.error("Erreur création profil {} {}", prenom, nom, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur interne serveur");

        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }


    // ────────────────────────────────────────────────
    // 3️⃣ SCORE + POTENTIEL PAR NOM
    // ────────────────────────────────────────────────

    @GetMapping("/profile/score")
    @Operation(summary = "Score et potentiel via nom + prénom")
    public ResponseEntity<?> getProfileScore(
            @RequestParam String prenom,
            @RequestParam String nom) {

        try {

            TalentProfile profile =
                    talentProfileService.getLatestProfileByFullName(prenom, nom);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("prenom", prenom);
            response.put("nom", nom);
            response.put("scoreGlobal", profile.getScoreGlobal());
            response.put("potentiel", profile.getPotentiel());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Score introuvable pour {} {}", prenom, nom);
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // 4️⃣ COMPARAISON PAR NOM
    // ────────────────────────────────────────────────

    @PostMapping("/compare")
    @Operation(summary = "Comparer deux talents via nom + prénom")
    public ResponseEntity<?> compareByFullName(
            @RequestParam String prenomA,
            @RequestParam String nomA,
            @RequestParam String prenomB,
            @RequestParam String nomB) {

        try {

            TalentProfile profileA =
                    talentProfileService.getLatestProfileByFullName(prenomA, nomA);

            TalentProfile profileB =
                    talentProfileService.getLatestProfileByFullName(prenomB, nomB);

            TalentComparison comparison =
                    comparisonService.compare(profileA.getId(), profileB.getId());

            return ResponseEntity.ok(comparison);

        } catch (Exception e) {
            log.error("Erreur comparaison entre {} {} et {} {}",
                    prenomA, nomA, prenomB, nomB, e);

            return ResponseEntity.badRequest()
                    .body("Erreur comparaison");
        }
    }

    // ────────────────────────────────────────────────
    // 5️⃣ LISTE DES PROFILS
    // ────────────────────────────────────────────────

    @GetMapping("/profiles")
    @Operation(summary = "Tous les profils talent")
    public ResponseEntity<List<TalentProfile>> getAllProfiles() {

        List<TalentProfile> profiles =
                talentProfileService.getAllTalentProfiles();

        if (profiles.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(profiles);
    }
    // ────────────────────────────────────────────────
// 6️⃣ TALENT RANKING (Leaderboard)
// ────────────────────────────────────────────────

    @GetMapping("/ranking")
    @Operation(summary = "Classement des talents par score global avec nom et prénom")
    public ResponseEntity<List<Map<String, Object>>> getTalentRanking() {

        // 🔹 Récupérer profils et créer mutable list
        List<TalentProfile> profiles = new ArrayList<>(
                talentProfileService.getAllTalentProfiles()
                        .stream()
                        .filter(p -> p.getScoreGlobal() != null)
                        .toList()
        );

        if (profiles.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        // 🔹 Trier par scoreGlobal décroissant
        profiles.sort(Comparator.comparing(TalentProfile::getScoreGlobal).reversed());

        List<Map<String, Object>> ranking = new ArrayList<>();
        int position = 1;

        for (TalentProfile profile : profiles) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rank", position++);
            row.put("candidatId", profile.getCandidatId());
            row.put("scoreGlobal", profile.getScoreGlobal());
            row.put("potentiel", profile.getPotentiel());

            // 🔹 Récupérer prénom et nom via Feign Client
            try {
                if (profile.getCandidatId() != null) {
                    CandidatDTO candidat = candidatClient.getById(profile.getCandidatId());
                    if (candidat != null) {
                        row.put("prenom", candidat.getPrenom());
                        row.put("nom", candidat.getNom());
                    } else {
                        row.put("prenom", "Inconnu");
                        row.put("nom", "Inconnu");
                    }
                } else {
                    row.put("prenom", "Inconnu");
                    row.put("nom", "Inconnu");
                }
            } catch (Exception e) {
                log.error("Erreur récupération candidat pour ID {}", profile.getCandidatId(), e);
                row.put("prenom", "Erreur");
                row.put("nom", "Erreur");
            }

            ranking.add(row);
        }

        return ResponseEntity.ok(ranking);
    }
    @PatchMapping(value = "/profile/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Mettre à jour le CV et recalculer le score via nom + prénom")
    public ResponseEntity<?> updateProfileCV(
            @RequestParam String prenom,
            @RequestParam String nom,
            @RequestPart(value = "cv", required = true) MultipartFile cvFile) {

        if (cvFile == null || cvFile.isEmpty()) {
            return ResponseEntity.badRequest().body("Le fichier CV est obligatoire");
        }

        File tempFile = null;

        try {
            // Créer un fichier temporaire
            tempFile = File.createTempFile("cv_", ".pdf");
            cvFile.transferTo(tempFile);

            // Appeler le service pour créer/update le profil + recalculer le score
            TalentProfile updatedProfile = talentProfileService.createOrUpdateProfileFromCandidat(prenom, nom, tempFile);

            return ResponseEntity.ok(updatedProfile);

        } catch (IllegalArgumentException e) {
            log.warn("Candidat introuvable: {} {}", prenom, nom);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidat introuvable");

        } catch (Exception e) {
            log.error("Erreur mise à jour CV pour {} {}", prenom, nom, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur");

        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }
    @GetMapping("/profiles/search")
    @Operation(summary = "Recherche de profils par score, potentiel ou mot-clé")
    public ResponseEntity<List<Map<String, Object>>> searchProfiles(
            @RequestParam(required = false) Double minScore,
            @RequestParam(required = false) Double maxScore,
            @RequestParam(required = false) String keyword) {

        try {
            // 🔹 Récupérer tous les profils filtrés par service
            List<TalentProfile> filteredProfiles = talentProfileService.searchProfiles ( minScore, maxScore, keyword );

            if (filteredProfiles.isEmpty ()) {
                return ResponseEntity.noContent ().build ();
            }

            // 🔹 Transformer les profils en JSON clair
            List<Map<String, Object>> response = new ArrayList<> ();

            for (TalentProfile profile : filteredProfiles) {
                Map<String, Object> map = new LinkedHashMap<> ();
                map.put ( "candidatId", profile.getCandidatId () );
                map.put ( "scoreGlobal", profile.getScoreGlobal () );
                map.put ( "potentiel", profile.getPotentiel () );

                // 🔹 Récupérer prénom et nom via Feign Client
                try {
                    if (profile.getCandidatId () != null) {
                        CandidatDTO candidat = candidatClient.getById ( profile.getCandidatId () );
                        if (candidat != null) {
                            map.put ( "prenom", candidat.getPrenom () );
                            map.put ( "nom", candidat.getNom () );
                        } else {
                            map.put ( "prenom", "Inconnu" );
                            map.put ( "nom", "Inconnu" );
                        }
                    } else {
                        map.put ( "prenom", "Inconnu" );
                        map.put ( "nom", "Inconnu" );
                    }
                } catch (Exception e) {
                    log.error ( "Erreur récupération candidat pour ID {}", profile.getCandidatId (), e );
                    map.put ( "prenom", "Erreur" );
                    map.put ( "nom", "Erreur" );
                }

                response.add ( map );
            }

            return ResponseEntity.ok ( response );

        } catch (Exception e) {
            log.error ( "Erreur lors de la recherche de profils", e );
            return ResponseEntity.internalServerError ().body ( Collections.singletonList (
                    Map.of ( "error", "Erreur interne serveur" )
            ) );
        }


    }
    @GetMapping("/all")
    public String hello(){
        return "Hello scoutisme";
    }
}
