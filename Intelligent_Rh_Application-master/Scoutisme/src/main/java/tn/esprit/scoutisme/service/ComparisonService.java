package tn.esprit.scoutisme.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.scoutisme.entity.Potentiel;
import tn.esprit.scoutisme.entity.TalentComparison;
import tn.esprit.scoutisme.entity.TalentProfile;
import tn.esprit.scoutisme.repository.TalentComparisonRepository;
import tn.esprit.scoutisme.repository.TalentProfileRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ComparisonService {

    private final TalentProfileRepository talentProfileRepository;
    private final TalentComparisonRepository comparisonRepository;
    private final ScoringService scoringService;

    public TalentComparison compare(Long talentAId, Long talentBId) {

        if (talentAId.equals(talentBId))
            throw new IllegalArgumentException("Impossible de comparer un talent avec lui-même");

        // Récupération des profils
        TalentProfile talentA = talentProfileRepository.findById(talentAId)
                .orElseThrow(() -> new RuntimeException("Talent A introuvable : " + talentAId));
        TalentProfile talentB = talentProfileRepository.findById(talentBId)
                .orElseThrow(() -> new RuntimeException("Talent B introuvable : " + talentBId));

        // Calcul dynamique du score global et mise à jour du profil si nécessaire
        double scoreA = scoringService.calculateScore(talentA);
        double scoreB = scoringService.calculateScore(talentB);

        talentA.setScoreGlobal(scoreA);
        talentA.setPotentiel(determinePotentiel(scoreA));

        talentB.setScoreGlobal(scoreB);
        talentB.setPotentiel(determinePotentiel(scoreB));

        // Sauvegarde dynamique des profils avec score et potentiel calculés
        talentProfileRepository.save(talentA);
        talentProfileRepository.save(talentB);

        // Création de la comparaison
        TalentComparison comparison = new TalentComparison();
        comparison.setTalentA(talentA);
        comparison.setTalentB(talentB);
        comparison.setScoreA(scoreA);
        comparison.setScoreB(scoreB);
        comparison.setWinner(determineWinner(scoreA, scoreB));

        log.info("Comparaison effectuée : TalentA={} Score={} | TalentB={} Score={} | Winner={}",
                talentA.getCandidatId(), scoreA, talentB.getCandidatId(), scoreB, comparison.getWinner());

        return comparisonRepository.save(comparison);
    }

    private String determineWinner(double scoreA, double scoreB) {
        if (Math.abs(scoreA - scoreB) < 0.5) return "DRAW";
        return scoreA > scoreB ? "TALENT_A" : "TALENT_B";
    }

    private Potentiel determinePotentiel(double score) {
        if (score >= 80) return Potentiel.valueOf ( "EXCELLENT" );
        if (score >= 50) return Potentiel.valueOf ( "MOYEN" );
        return Potentiel.valueOf ( "FAIBLE" );
    }

    public List<TalentComparison> getComparisonHistory(Long talentId) {
        return comparisonRepository.findByTalentId(talentId);
    }
}
