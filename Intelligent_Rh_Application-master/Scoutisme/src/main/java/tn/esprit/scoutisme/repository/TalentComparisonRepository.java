package tn.esprit.scoutisme.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.scoutisme.entity.TalentComparison;

import java.util.List;

public interface TalentComparisonRepository extends JpaRepository<TalentComparison, Long> {

    @Query("""
        SELECT tc FROM TalentComparison tc
        WHERE tc.talentA.id = :talentId OR tc.talentB.id = :talentId
    """)
    List<TalentComparison> findByTalentId(@Param("talentId") Long talentId);

    @Query("""
        SELECT COUNT(tc) FROM TalentComparison tc
        WHERE tc.talentA.id = :talentId OR tc.talentB.id = :talentId
    """)
    long countByTalent(@Param("talentId") Long talentId);
}
