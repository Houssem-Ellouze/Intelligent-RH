package tn.esprit.recrutement.service;

import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.recrutement.DTO.CandidatDTO;
import tn.esprit.recrutement.client.CandidatClient;
import tn.esprit.recrutement.entity.*;
import tn.esprit.recrutement.repository.*;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CandidatureService {

    @Autowired private CandidatureRepository candidatureRepository;
    @Autowired private OffreEmploiRepository offreEmploiRepository;
    @Autowired private EntretienRepository entretienRepository;
    private CandidatClient candidatClient;

    public CandidatureService(@Qualifier("tn.esprit.recrutement.client.CandidatClient") CandidatClient candidatClient) {
        this.candidatClient = candidatClient;
    }

    // --- 1. GESTION DES OFFRES (ADMIN) ---


    public List<Candidature> getCandidaturesByDateRdv() {

        List<Candidature> candidatures =
                candidatureRepository.findAllWithEntretiens();

        candidatures.forEach(c -> {
            if (c.getCandidatId() != null) {
                try {
                    c.setInfos_candidat(
                            candidatClient.getById(c.getCandidatId())
                    );
                } catch (Exception e) {
                    // Ne pas casser l'affichage du calendrier
                    c.setInfos_candidat(null);
                }
            }
        });

        return candidatures;
    }



    @Transactional
    public Candidature getCandidatureById(@PathVariable Long id){
        return candidatureRepository.getCandidatureById(id);
    }

    @Transactional(readOnly = true)
    public List<Candidature> getAllCandidatures() {

        return candidatureRepository.findAll();
    }


    @Transactional
    public OffreEmploi creerOffre(OffreEmploi offre) {
        // Initialisation automatique pour respecter le workflow
        offre.setDatePublication(LocalDate.now());
        offre.setStatut(StatutOffre.PUBLIEE);
        return offreEmploiRepository.save(offre);
    }

    public List<OffreEmploi> listerOffresActives() {
        return offreEmploiRepository.findByStatut(StatutOffre.PUBLIEE);
    }

    // --- 2. GESTION DES CANDIDATURES (CANDIDAT) ---

    @Transactional
    public Candidature postuler(Long offreId, String prenom, String nom) {
        // 1. Vérification Offre
        OffreEmploi offre = offreEmploiRepository.findById(offreId)
                .orElseThrow(() -> new NoSuchElementException("L'offre #" + offreId + " n'existe plus."));

        // 2. Appel Feign avec gestion d'erreur précise
        CandidatDTO candidat;
        try {
            candidat = candidatClient.getByFullIdentity(prenom, nom);
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Candidat inconnu : " + prenom + " " + nom + ". Veuillez vérifier l'orthographe.");
        } catch (Exception e) {
            throw new RuntimeException("Le service Talent est indisponible actuellement.");
        }

        // 3. Création Candidature
        Candidature candidature = new Candidature();
        candidature.setOffre(offre);
        candidature.setCandidatId(candidat.getId()); // On lie l'ID récupéré
        candidature.setEtat(EtatCandidature.NOUVELLE);
        candidature.setDatePostulation(LocalDateTime.now());

        return candidatureRepository.save(candidature);
    }
    // --- 3. WORKFLOW DE RECRUTEMENT (RH/ADMIN) ---

    @Transactional
    public Entretien planifierEntretien(Long candidatureId, Entretien entretien) {
        Candidature cand = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new NoSuchElementException("Candidature introuvable"));

        // Passage automatique à l'étape suivante du workflow
        cand.setEtat(EtatCandidature.ENTRETIEN_EN_COURS);

        entretien.setCandidature(cand);
        candidatureRepository.save(cand);
        return entretienRepository.save(entretien);
    }



    // --- 4. CONSULTATION 360° ---
    @Transactional
    public void mettreAJourStatutCandidature(Long candidatureId, EtatCandidature nouvelEtat, Integer note, String commentaire) {
        // 1. Recherche de la candidature
        Candidature cand = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new NoSuchElementException("Candidature #" + candidatureId + " introuvable"));

        // 2. Mise à jour du statut
        cand.setEtat(nouvelEtat);

        // 3. Ajout de l'évaluation RH (Note et Commentaire)
        if (note != null) {
            cand.setNoteRH(note);
        }
        if (commentaire != null) {
            cand.setCommentaireRH(commentaire);
        }

        // 4. Logique métier : Clôture de l'offre si accepté
        if (nouvelEtat == EtatCandidature.ACCEPTEE) {
            OffreEmploi offre = cand.getOffre();
            if (offre != null) {
                offre.setStatut(StatutOffre.CLOTUREE);
                offreEmploiRepository.save(offre);
            }
        }

        // 5. Sauvegarde finale
        candidatureRepository.save(cand);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCandidaturePourOnboarding(Long id) {
        Candidature cand = candidatureRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Candidature introuvable"));

        Map<String, Object> map = new HashMap<>();
        map.put("id", cand.getId());
        map.put("noteRH", cand.getNoteRH());
        map.put("commentaireRH", cand.getCommentaireRH());

        try {
            // On récupère le nom/prénom depuis le service Talent pour le passer à Onboarding
            CandidatDTO infoCandidat = candidatClient.getById(cand.getCandidatId());
            map.put("nom", infoCandidat.getNom());
            map.put("prenom", infoCandidat.getPrenom());
        } catch (Exception e) {
            map.put("nom", "Inconnu");
            map.put("prenom", "Inconnu");
        }
        return map;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> consulterDossierComplet(Long candidatureId) {
        Candidature cand = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new NoSuchElementException("Candidature introuvable"));

        Map<String, Object> dossier = new LinkedHashMap<>();
        dossier.put("candidature_id", cand.getId());
        dossier.put("etat_actuel", cand.getEtat());
        dossier.put("offre_concernee", cand.getOffre().getTitre());

        // Récupération des données distantes via Feign
        try {
            dossier.put("infos_candidat", candidatClient.getById(cand.getCandidatId()));
        } catch (Exception e) {
            dossier.put("infos_candidat", "Données candidat indisponibles (Service Talent)");
        }

        dossier.put("historique_entretiens", cand.getEntretiens());
        return dossier;
    }
    @Transactional(readOnly = true)
    public List<Map<String, Object>> consulterTousLesDossiersComplets() {
        List<Candidature> candidatures = candidatureRepository.findAllWithEntretiens();

        return candidatures.stream().map(cand -> {
            Map<String, Object> dossier = new LinkedHashMap<>();

            dossier.put("candidature_id", cand.getId());
            dossier.put("etat_actuel", cand.getEtat());

            String titreOffre = Optional.ofNullable(cand.getOffre())
                    .map(OffreEmploi::getTitre)
                    .orElse("Offre supprimée");
            dossier.put("offre_concernee", titreOffre);

            if (cand.getCandidatId() != null) {
                try {
                    dossier.put("infos_candidat", candidatClient.getById(cand.getCandidatId()));
                } catch (Exception e) {
                    dossier.put("infos_candidat", "Indisponible");
                }
            } else {
                dossier.put("infos_candidat", null);
            }

            dossier.put("historique_entretiens",
                    cand.getEntretiens() != null ? cand.getEntretiens() : List.of());

            return dossier;
        }).collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public Map<String, Object> getCandidatureStats() {

        List<Candidature> candidatures = candidatureRepository.findAll();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");

        // --- Statistiques mensuelles : nombre de candidatures par mois ---
        Map<String, Long> candidaturesPerMonth = candidatures.stream()
                .collect(Collectors.groupingBy(
                        c -> sdf.format( Timestamp.valueOf(c.getDatePostulation())),
                        Collectors.counting()
                ));

        // --- Moyenne des entretiens par mois ---
        Map<String, Double> averageEntretiensPerMonth = candidatures.stream()
                .collect(Collectors.groupingBy(
                        c -> sdf.format( Timestamp.valueOf(c.getDatePostulation())),
                        Collectors.averagingInt(c -> c.getEntretiens() != null ? c.getEntretiens().size() : 0)
                ));

        // --- Répartition des candidatures selon l'état ---
        Map<String, Long> candidaturesByEtat = candidatures.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getEtat().name(),
                        Collectors.counting()
                ));

        // --- Nombre de candidatures par offre ---
        Map<String, Long> candidaturesPerOffre = candidatures.stream()
                .collect(Collectors.groupingBy(
                        c -> Optional.ofNullable(c.getOffre()).map(OffreEmploi::getTitre).orElse("Offre supprimée"),
                        Collectors.counting()
                ));

        // --- Moyenne d'entretiens par offre ---
        Map<String, Double> averageEntretiensPerOffre = candidatures.stream()
                .collect(Collectors.groupingBy(
                        c -> Optional.ofNullable(c.getOffre()).map(OffreEmploi::getTitre).orElse("Offre supprimée"),
                        Collectors.averagingInt(c -> c.getEntretiens() != null ? c.getEntretiens().size() : 0)
                ));

        // --- Répartition par domaine principal du candidat ---
        Map<String, Long> candidaturesByDomaine = candidatures.stream().map(c -> {
            if (c.getCandidatId() != null) {
                try {
                    return Optional.ofNullable(candidatClient.getById(c.getCandidatId()))
                            .map(cdt -> cdt.getDomainePrincipale())
                            .orElse("Domaine inconnu");
                } catch (Exception e) {
                    return "Service Talent indisponible";
                }
            } else {
                return "ID Candidat manquant";
            }
        }).collect(Collectors.groupingBy(domaine -> domaine, Collectors.counting()));

        // --- Compilation finale ---
        Map<String, Object> stats = new HashMap<>();
        stats.put("candidaturesPerMonth", candidaturesPerMonth);
        stats.put("averageEntretiensPerMonth", averageEntretiensPerMonth);
        stats.put("candidaturesByEtat", candidaturesByEtat);
        stats.put("candidaturesPerOffre", candidaturesPerOffre);
        stats.put("averageEntretiensPerOffre", averageEntretiensPerOffre);
        stats.put("candidaturesByDomaine", candidaturesByDomaine);
        stats.put("totalCandidatures", candidatures.size());

        return stats;
    }




}