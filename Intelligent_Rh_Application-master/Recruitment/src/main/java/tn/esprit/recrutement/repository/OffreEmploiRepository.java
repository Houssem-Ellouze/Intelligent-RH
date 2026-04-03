package tn.esprit.recrutement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.recrutement.entity.OffreEmploi;
import tn.esprit.recrutement.entity.StatutOffre;

import java.util.List;

@Repository
public interface OffreEmploiRepository extends JpaRepository<OffreEmploi, Long> {
    List<OffreEmploi> findByStatut(StatutOffre statut);
}