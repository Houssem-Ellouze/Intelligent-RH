package tn.esprit.recrutement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.recrutement.entity.*;
import tn.esprit.recrutement.service.CandidatureService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recrutement")
public class CandidatureController {

    @Autowired
    private CandidatureService candidatureService;

    @GetMapping("/candidatures/all")
    public List<Candidature> getAllCandidatures() {
        return candidatureService.getAllCandidatures();
    }


    @GetMapping("/candidatures/{id}")
    public ResponseEntity<Map<String, Object>> getCandidatureById(@PathVariable Long id) {
        // Appel de votre fonctionnalité spécifique
        Map<String, Object> dossier = candidatureService.getCandidaturePourOnboarding(id);

        return ResponseEntity.ok(dossier);
    }

    // 1. Créer une offre (ADMIN)
    @PostMapping("/offres")
    public ResponseEntity<OffreEmploi> creerOffre(@RequestBody OffreEmploi offre) {
        return new ResponseEntity<>(candidatureService.creerOffre(offre), HttpStatus.CREATED);
    }

    // 2. Lister les offres pour les candidats
    @GetMapping("/offres/actives")
    public ResponseEntity<List<OffreEmploi>> listerOffres() {
        return ResponseEntity.ok(candidatureService.listerOffresActives());
    }

    // 3. Postuler à une offre (candidat)
    @PostMapping("/postuler")
    public ResponseEntity<?> postuler(
            @RequestParam Long offreId,
            @RequestParam String prenom,
            @RequestParam String nom) {
        try {
            // Création de la candidature avec date + heure
            Candidature candidature = candidatureService.postuler(offreId, prenom, nom);

            // Assurer que datePostulation contient l'heure actuelle
            if (candidature.getDatePostulation() == null) {
                candidature.setDatePostulation(LocalDateTime.now());
            }

            return new ResponseEntity<>(candidature, HttpStatus.CREATED);
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Une erreur inattendue est survenue."));
        }
    }

    // 4. Planifier un entretien (RH)
    @PostMapping("/candidatures/{id}/entretiens")
    public ResponseEntity<Entretien> planifierEntretien(
            @PathVariable Long id,
            @RequestBody Entretien entretien) {

        // Assurer que l'entretien contient date + heure
        if (entretien.getDateHeure () == null) {
            entretien.setDateHeure ( LocalDateTime.now());
        }

        Entretien savedEntretien = candidatureService.planifierEntretien(id, entretien);
        return ResponseEntity.ok(savedEntretien);
    }


    // 5. Accepter ou Refuser (RH/ADMIN)
    @PatchMapping("/statut/{candidatureId}")
    public ResponseEntity<?> mettreAJourStatutCandidature(
            @PathVariable Long candidatureId,
            @RequestParam EtatCandidature etat,
            @RequestParam(required = false) Integer note,
            @RequestParam(required = false) String commentaire) {

        candidatureService.mettreAJourStatutCandidature(candidatureId, etat, note, commentaire);
        return ResponseEntity.ok(Map.of("message", "Dossier mis à jour avec succès"));
    }

    // 6. Voir le dossier complet (Vue 360°)
    @GetMapping("/candidatures/{id}/dossier")
    public ResponseEntity<Map<String, Object>> voirDossier(@PathVariable Long id) {
        return ResponseEntity.ok(candidatureService.consulterDossierComplet(id));
    }
    @GetMapping("/dossiers-complets")
    public ResponseEntity<List<Map<String, Object>>> getAllDossiers() {
        try {
            List<Map<String, Object>> dossiers = candidatureService.consulterTousLesDossiersComplets();

            if (dossiers.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(dossiers);
        } catch (Exception e) {
            // ✅ Log de l'erreur pour debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of(Map.of("error", "Erreur serveur: " + e.getMessage())));
        }
    }

    @GetMapping("/candidatures/rdv")
    public ResponseEntity<List<Candidature>> getCandidaturesRdv() {

        List<Candidature> candidatures = candidatureService.getCandidaturesByDateRdv();
        return ResponseEntity.ok(candidatures);
    }
    @GetMapping("/dashboard")
    public Map<String, Object> getCandidatureStats() {
        return candidatureService.getCandidatureStats();
    }





}