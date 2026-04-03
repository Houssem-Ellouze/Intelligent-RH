package tn.esprit.employees.auth;


import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    // Rechercher un token exact
    Optional<Token> findByToken(String token);

    // Récupérer tous les tokens valides pour un candidat
    @Query("SELECT t FROM Token t WHERE t.candidat.id = :candidatId AND (t.expired = false OR t.revoked = false)")
    List<Token> findAllValidTokenByUser(@Param("candidatId") Long candidatId);

    // Supprimer tous les tokens d’un candidat
    @Modifying
    @Transactional
    @Query("DELETE FROM Token t WHERE t.candidat.id = :candidatId")
    void deleteAllByUserId(@Param("candidatId") Long candidatId);

    @Modifying
    @Query("DELETE FROM Token t WHERE t.candidat.id = :id")
    void deleteByCandidatId(@Param("id") Long id);
}
