package tn.esprit.recrutement.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.recrutement.entity.Entretien;
@Repository
public interface EntretienRepository extends JpaRepository<Entretien,Long> {

}

