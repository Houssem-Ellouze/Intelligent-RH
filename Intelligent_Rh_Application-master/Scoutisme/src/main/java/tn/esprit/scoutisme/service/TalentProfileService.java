package tn.esprit.scoutisme.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.scoutisme.DTO.CandidatDTO;
import tn.esprit.scoutisme.client.CandidatClient;
import tn.esprit.scoutisme.entity.Potentiel;
import tn.esprit.scoutisme.entity.SkillScore;
import tn.esprit.scoutisme.entity.TalentProfile;
import tn.esprit.scoutisme.repository.TalentProfileRepository;

import java.io.File;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TalentProfileService {

    private final TalentProfileRepository talentProfileRepository;
    private final CandidatClient candidatClient;
    private final ScoringService scoringService;
    private final PdfTalentService pdfTalentService;

    @Transactional
    public TalentProfile saveProfile(TalentProfile profile) {
        return talentProfileRepository.save(profile);
    }

    public List<TalentProfile> getAllTalentProfiles() {
        return talentProfileRepository.findAll();
    }

    public Optional<TalentProfile> findById(Long id) {
        return talentProfileRepository.findById(id);
    }

    public TalentProfile getById(Long id) {
        return findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profil talent non trouvé : " + id));
    }

    public TalentProfile getLatestProfileByFullName(String prenom, String nom) {
        CandidatDTO candidat = candidatClient.getByFullIdentity(prenom, nom);
        if (candidat == null) {
            throw new IllegalArgumentException("Candidat introuvable");
        }
        return getLatestByCandidatId(candidat.getId());
    }

    @Transactional
    public TalentProfile updateScore(Long profileId, Double scoreGlobal, String potentiel) {
        TalentProfile profile = getById(profileId);

        if (scoreGlobal != null) profile.setScoreGlobal(scoreGlobal);
        if (potentiel != null) profile.setPotentiel(Potentiel.valueOf(potentiel));

        return talentProfileRepository.save(profile);
    }

    public List<TalentProfile> searchProfiles(Double minScore, Double maxScore, String keyword) {
        List<TalentProfile> allProfiles = talentProfileRepository.findAll();

        return allProfiles.stream()
                .filter(profile -> {
                    if (minScore != null && (profile.getScoreGlobal() == null || profile.getScoreGlobal() < minScore)) return false;
                    if (maxScore != null && (profile.getScoreGlobal() == null || profile.getScoreGlobal() > maxScore)) return false;

                    if (keyword != null && !keyword.isBlank()) {
                        try {
                            // Note: Pour une recherche réelle, il vaudrait mieux filtrer côté DB ou via un DTO enrichi
                            CandidatDTO candidat = candidatClient.getById(profile.getCandidatId());
                            if (candidat == null) return false;
                            String fullIdentity = (candidat.getPrenom() + " " + candidat.getNom()).toLowerCase();
                            return fullIdentity.contains(keyword.toLowerCase());
                        } catch (Exception e) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public TalentProfile createOrUpdateProfileFromCandidat(String prenom, String nom, File cvFile) {
        CandidatDTO candidat = candidatClient.getByFullIdentity(prenom, nom);
        if (candidat == null) throw new IllegalArgumentException("Candidat introuvable : " + prenom + " " + nom);

        Long candidatId = candidat.getId();
        TalentProfile profile = findLatestByCandidatId(candidatId)
                .orElseGet(() -> {
                    TalentProfile newProfile = new TalentProfile();
                    newProfile.setCandidatId(candidatId);
                    return newProfile;
                });

        profile.setDateEvaluation(LocalDate.now());

        // Extraction PDF
        List<SkillScore> finalSkills = new ArrayList<>();
        if (cvFile != null && cvFile.exists() && cvFile.length() > 0) {
            try {
                String text = pdfTalentService.extractTextFromPDF(cvFile);
                finalSkills.addAll(pdfTalentService.extractSkillsFromText(text, profile));
            } catch (Exception e) {
                log.warn("Erreur extraction PDF pour {} {}", prenom, nom, e);
            }
        }

        // Fusion avec compétences DB (Candidat-Service)
        if (candidat.getCompetences() != null) {
            Set<String> existingNames = finalSkills.stream()
                    .map(s -> s.getCompetence().toLowerCase())
                    .collect(Collectors.toSet());

            candidat.getCompetences().stream()
                    .filter(c -> !existingNames.contains(c.getLibelle().toLowerCase()))
                    .forEach(c -> {
                        SkillScore ss = new SkillScore();
                        ss.setCompetence(c.getLibelle());
                        ss.setTalentProfile(profile);
                        finalSkills.add(ss);
                    });
        }

        // REMPLACEMENT DES COMPÉTENCES (Correction du "Cannot find symbol")
        if (profile.getSkills() != null) {
            profile.getSkills().clear();
            profile.getSkills().addAll(finalSkills);
        } else {
            profile.setSkills(finalSkills);
        }

        scoringService.updateProfileScore(profile);
        return talentProfileRepository.save(profile);
    }

    public Optional<TalentProfile> findLatestByCandidatId(Long candidatId) {
        return talentProfileRepository.findAllByCandidatId(candidatId).stream()
                .max(Comparator.comparing(TalentProfile::getDateEvaluation));
    }

    public TalentProfile getLatestByCandidatId(Long candidatId) {
        return findLatestByCandidatId(candidatId)
                .orElseThrow(() -> new IllegalArgumentException("Aucun profil pour candidat " + candidatId));
    }

    @Transactional
    public ResponseEntity<List<CandidatDTO>> enrichCandidatsWithLatestProfile() {
        List<CandidatDTO> candidats = candidatClient.getAll().getBody();
        if (candidats == null) return ResponseEntity.ok(Collections.emptyList());

        candidats.forEach(c -> findLatestByCandidatId(c.getId()).ifPresent(c::setTalentProfile));
        return ResponseEntity.ok(candidats);
    }

    @Transactional
    public TalentProfile recalculateScore(Long profileId) {
        TalentProfile profile = getById(profileId);
        scoringService.updateProfileScore(profile);
        return talentProfileRepository.save(profile);
    }

    public Potentiel determinePotentiel(double score) {
        if (score >= 90.0) return Potentiel.EXCELLENT;
        if (score >= 80.0) return Potentiel.ELEVE;
        if (score >= 50.0) return Potentiel.MOYEN;
        return Potentiel.FAIBLE;
    }
}