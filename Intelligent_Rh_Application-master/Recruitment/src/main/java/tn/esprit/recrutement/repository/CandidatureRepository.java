package tn.esprit.recrutement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.recrutement.entity.Candidature;

import java.util.List;

@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    @Query("SELECT DISTINCT c FROM Candidature c LEFT JOIN FETCH c.entretiens LEFT JOIN FETCH c.offre")
    List<Candidature> findAllWithEntretiens();

    Candidature getCandidatureById(Long id);
}