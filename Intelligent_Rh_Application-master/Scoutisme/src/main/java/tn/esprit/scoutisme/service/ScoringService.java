package tn.esprit.scoutisme.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.scoutisme.entity.EvaluationScout;
import tn.esprit.scoutisme.entity.Potentiel;
import tn.esprit.scoutisme.entity.SkillScore;
import tn.esprit.scoutisme.entity.TalentProfile;

import java.util.Objects;

/**
 * Service responsable du calcul du score global et du potentiel d'un TalentProfile.
 */
@Slf4j
@Service
public class ScoringService {

    // ────────────────────────────────────────────────
    //  Constantes de pondération
    // ────────────────────────────────────────────────
    private static final double SKILL_CONTRIBUTION    = 0.65;  // Augmenté pour valoriser plus les compétences
    private static final double SCOUT_CONTRIBUTION    = 0.35;

    private static final double LEADERSHIP_WEIGHT     = 0.60;
    private static final double DISCIPLINE_WEIGHT     = 0.40;

    private static final double DEFAULT_SKILL_SCORE   = 50.0;
    private static final double DEFAULT_SCOUT_SCORE   = 50.0;
    private static final double MIN_VALID_WEIGHT      = 0.001;

    /**
     * Calcule le score global pondéré d'un profil.
     */
    public double calculateScore(TalentProfile profile) {
        if (profile == null) {
            log.warn("calculateScore appelé avec profil null");
            return 0.0;
        }

        double skillScore = calculateSkillScore(profile);
        double scoutScore = calculateScoutScore(profile);

        double baseScore = (skillScore * SKILL_CONTRIBUTION) + (scoutScore * SCOUT_CONTRIBUTION);

        // Bonus pour compétences premium (poids >= 8.0)
        long premiumCount = profile.getSkills().stream()
                .filter(s -> s.getPoids() != null && s.getPoids() >= 8.0)
                .count();

        double bonusMultiplier = switch ((int) premiumCount) {
            case 0, 1, 2, 3, 4 -> 1.00;
            case 5, 6, 7       -> 1.08;
            case 8, 9, 10      -> 1.15;
            default            -> 1.22;  // 11+ compétences premium
        };

        return Math.min(100.0, baseScore * bonusMultiplier);
    }

    /**
     * Score moyen pondéré des compétences.
     * Si aucun poids valide → retourne 50.0 (neutre)
     */
    private double calculateSkillScore(TalentProfile profile) {
        if (profile.getSkills() == null || profile.getSkills().isEmpty()) {
            return DEFAULT_SKILL_SCORE;
        }


        double weightedSum = 0.0;
        double totalWeight = 0.0;

        for (SkillScore skill : profile.getSkills()) {
            Double score = skill.getScore();
            Double poids = skill.getPoids();

            if (score != null && poids != null && poids > 0) {
                weightedSum += score * poids;
                totalWeight += poids;
            }
        }

        if (totalWeight < MIN_VALID_WEIGHT) {
            log.debug("Aucun poids valide pour le profil {} → score compétences neutre",
                    profile.getId());
            return DEFAULT_SKILL_SCORE;
        }

        return weightedSum / totalWeight;
    }

    /**
     * Score de l'évaluation scout (leadership 60% + discipline 40%).
     */
    private double calculateScoutScore(TalentProfile profile) {
        EvaluationScout eval = profile.getEvaluationScout();
        if (eval == null) {
            return DEFAULT_SCOUT_SCORE;
        }

        int leadership = Objects.requireNonNullElse(eval.getLeadership(), 0);
        int discipline  = Objects.requireNonNullElse(eval.getDiscipline(), 0);

        double leadershipScore = Math.min(100, Math.max(0, leadership));
        double disciplineScore = Math.min(100, Math.max(0, discipline));

        return (leadershipScore * LEADERSHIP_WEIGHT) + (disciplineScore * DISCIPLINE_WEIGHT);
    }

    /**
     * Détermine le potentiel à partir du score global.
     */
    public Potentiel determinePotentiel(double score) {
        if (score >= 90.0) return Potentiel.EXCELLENT;
        if (score >= 80.0) return Potentiel.ELEVE;
        if (score >= 50.0) return Potentiel.MOYEN;
        return Potentiel.FAIBLE;
    }

    /**
     * Met à jour le profil avec scoreGlobal et potentiel.
     * (ne sauvegarde pas — à faire dans le service appelant)
     */
    public TalentProfile updateProfileScore(TalentProfile profile) {
        if (profile == null) {
            log.warn("updateProfileScore appelé avec profil null");
            return null;
        }

        double score = calculateScore(profile);
        profile.setScoreGlobal(Math.round(score * 100.0) / 100.0); // 2 décimales
        profile.setPotentiel(determinePotentiel(score));

        log.debug("Profil {} → score = {}, potentiel = {}",
                profile.getId(), profile.getScoreGlobal(), profile.getPotentiel());

        return profile;
    }
}