package tn.esprit.admin_onboarding_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.admin_onboarding_service.entity.Collaborateur;

import java.util.Optional;

@Repository
public interface CollaborateurRepository extends JpaRepository<Collaborateur, Long> {
   Optional<Collaborateur> findByMatricule(String matricule);
}