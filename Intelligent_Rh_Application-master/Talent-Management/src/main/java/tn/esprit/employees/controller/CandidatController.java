package tn.esprit.employees.controller;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.employees.entity.Candidat;
import tn.esprit.employees.entity.Competence;
import tn.esprit.employees.entity.DomainePrincipale;
import tn.esprit.employees.repository.CandidatRepository;
import tn.esprit.employees.service.CandidatService;
import tn.esprit.employees.service.FileService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidats")
@RequiredArgsConstructor
@Slf4j
public class CandidatController {

    private final CandidatService service;
    private final FileService fileService;
    private final CandidatRepository repository;


    @GetMapping("/by-date")
    public List<Candidat> getByDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return service.findByDate(localDate);
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestPart("candidat") Candidat candidat, // Spring utilise Jackson ici automatiquement
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "cv", required = false) MultipartFile cv) {

        try {
            // Liaison bidirectionnelle
            if (candidat.getCompetences() != null) {
                candidat.getCompetences().forEach(comp -> {
                    comp.setCandidat(candidat);
                    if (comp.getDomainePrincipale() == null) {
                        comp.setDomainePrincipale(candidat.getDomainePrincipale());
                    }
                });
            }

            if (image != null && !image.isEmpty()) candidat.setFileName(fileService.save(image));
            if (cv != null && !cv.isEmpty()) candidat.setLienCV(fileService.save(cv));

            return new ResponseEntity<>(service.create(candidat), HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Erreur : ", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<Candidat> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Candidat> getByFullIdentity(
            @RequestParam String prenom,
            @RequestParam String nom) {

        return service.findByPrenomAndNom(prenom.trim(), nom.trim())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping
    public ResponseEntity<List<Candidat>> getAll() {
        List<Candidat> candidats = service.getAll();
        return ResponseEntity.ok(candidats);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestPart("candidat") String candidatJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "cv", required = false) MultipartFile cv
    ) {
        try {

            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());

            Candidat candidat = mapper.readValue(candidatJson, Candidat.class);

            Candidat updated = service.update(id, candidat, image, cv);

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 IMPORTANT pour voir la vraie erreur
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", e.getClass().getSimpleName(),
                            "message", e.getMessage()
                    ));
        }
    }

    /**
     * Suppression du candidat.
     * Note: Idéalement, il faudrait aussi supprimer le fichier sur le disque ici.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Optionnel: Récupérer le candidat avant suppression pour avoir le nom du fichier
        // Candidat c = service.getById(id);
        // fileService.deletePhysicalFile(c.getFileName());

        service.deleteById(id);
        log.info("Candidat avec ID {} supprimé", id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/all")
    public ResponseEntity<Page<Candidat>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size) {
        return ResponseEntity.ok(service.getAllCandidats(page, size));
    }
    @GetMapping("/check/{id}")
    public ResponseEntity<Boolean> checkCandidatExists(@PathVariable Long id) {
        return ResponseEntity.ok(repository.existsById(id));
    }
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = service.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}