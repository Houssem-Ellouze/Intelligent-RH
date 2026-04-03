package tn.esprit.admin_onboarding_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.admin_onboarding_service.entity.Departement;
import java.util.Optional;

@Repository
public interface DepartementRepository extends JpaRepository<Departement, Long> {

    Optional<Departement> findFirstByNomContaining(String keyword);
}