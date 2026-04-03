package tn.esprit.scoutisme.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.scoutisme.entity.TalentProfile;

import java.util.List;

@Repository
public interface TalentProfileRepository extends JpaRepository<TalentProfile, Long> {
    List<TalentProfile> findAllByCandidatId(Long candidatId);
}

