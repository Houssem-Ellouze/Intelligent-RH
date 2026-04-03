package tn.esprit.admin_onboarding_service.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.admin_onboarding_service.entity.Calendar;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, String> {
    Optional<Calendar> findByMonth(LocalDate month);
}
