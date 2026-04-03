package tn.esprit.employees.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.employees.entity.Candidat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatRepository extends JpaRepository<Candidat, Long> {

    Optional<Candidat> findByEmail(String email);
    List<Candidat> findByDateCreationBetween(
            LocalDateTime start,
            LocalDateTime end
    );
    Optional<Candidat> findByPrenomIgnoreCaseAndNomIgnoreCase(String prenom, String nom);

    List<Candidat> findBySpeciality(String speciality);
    boolean existsByEmail(String email);

}