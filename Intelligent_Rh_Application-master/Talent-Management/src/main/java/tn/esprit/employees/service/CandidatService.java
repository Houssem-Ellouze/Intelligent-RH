package tn.esprit.employees.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.employees.entity.Candidat;
import tn.esprit.employees.repository.CandidatRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidatService {

    private final CandidatRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final FileService fileService;

    @Transactional
    public List<Candidat> findByDate(LocalDate date) {
        return repository.findByDateCreationBetween (
                date.atStartOfDay(),
                date.atTime(23, 59, 59)
        );
    }

    @Transactional
    public Candidat create(Candidat candidat) {
        candidat.setDateCreation(LocalDateTime.now());

        if (candidat.getEnabled() == null) {
            candidat.setEnabled(false);
        }

        // Sécurité : s'assurer que le lien bidirectionnel est bien établi
        if (candidat.getCompetences() != null) {
            candidat.getCompetences().forEach(comp -> {
                comp.setCandidat(candidat);
                // Si le domaine est géré au niveau du candidat, on le propage ici si besoin
            });
        }

        return repository.save(candidat);
    }
    @Transactional(readOnly = true)
    public Candidat getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Candidat non trouvé avec l'id " + id));
    }


    @Transactional(readOnly = true)
    public Optional<Candidat> findByPrenomAndNom(String prenom, String nom) {
        return repository.findByPrenomIgnoreCaseAndNomIgnoreCase ( prenom, nom );
    }



    @Transactional(readOnly = true)
    public List<Candidat> getAll() {
        return repository.findAll();
    }

    @Transactional
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Candidat impossible à supprimer : id " + id);
        }
        repository.deleteById(id);
    }

    public Candidat update(Long id,
                           Candidat candidat,
                           MultipartFile image,
                           MultipartFile cv) {

        Candidat existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidat introuvable"));

        // 🔹 Mise à jour des champs simples
        existing.setNom(candidat.getNom());
        existing.setPrenom(candidat.getPrenom());
        existing.setEmail(candidat.getEmail());
        existing.setTelephone(candidat.getTelephone());
        existing.setDomainePrincipale(candidat.getDomainePrincipale());
        existing.setPosteActuel(candidat.getPosteActuel());
        existing.setLienLinkedin(candidat.getLienLinkedin());
        existing.setLienGitHub(candidat.getLienGitHub());
        existing.setAnneesExperience(candidat.getAnneesExperience());
        existing.setStatus(candidat.getStatus());


        // 🔥 Gestion compétences propre
        existing.getCompetences().clear();

        if (candidat.getCompetences() != null) {
            candidat.getCompetences().forEach(comp -> {
                comp.setCandidat(existing);
                existing.getCompetences().add(comp);
            });
        }

        // 🔥 Gestion fichiers
        if (image != null && !image.isEmpty()) {
            existing.setFileName(fileService.save(image));
        }

        if (cv != null && !cv.isEmpty()) {
            existing.setLienCV(fileService.save(cv));
        }

        return repository.save(existing);
    }
    public Page<Candidat> getAllCandidats(int page, int size) {
        return repository.findAll( PageRequest.of(page, size, Sort.by("dateCreation").descending()));
    }
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {

        List<Candidat> candidats = repository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        // 1. Nombre de candidats par mois
        Map<String, Long> candidatsParMois = candidats.stream()
                .filter(c -> c.getDateCreation() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getDateCreation().format(formatter),
                        Collectors.counting()
                ));

        // 2. Moyenne des compétences par mois
        Map<String, Double> moyenneCompetencesParMois = candidats.stream()
                .filter(c -> c.getDateCreation() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getDateCreation().format(formatter),
                        Collectors.averagingInt(
                                c -> c.getCompetences() != null ? c.getCompetences().size() : 0
                        )
                ));

        // 3. ✅ Répartition par expérience — null-safe
        //    - filtre les candidats dont anneesExperience est null
        //    - les null sont regroupés dans "Non renseigné"
        Map<String, Long> candidatsParExperience = candidats.stream()
                .collect(Collectors.groupingBy(
                        c -> {
                            // ✅ Correction : vérification null avant unboxing
                            Integer annees = c.getAnneesExperience();
                            if (annees == null) return "Non renseigné";

                            if (annees <= 1) return "Junior (0-1 an)";
                            else if (annees <= 3) return "Intermédiaire (2-3 ans)";
                            else if (annees <= 5) return "Confirmé (4-5 ans)";
                            else return "Senior (>5 ans)";
                        },
                        Collectors.counting()
                ));

        Map<String, Object> stats = new HashMap<>();
        stats.put("candidatsParMois",          candidatsParMois);
        stats.put("moyenneCompetencesParMois",  moyenneCompetencesParMois);
        stats.put("candidatsParExperience",     candidatsParExperience);
        stats.put("totalCandidats",             candidats.size());

        return stats;
    }

}