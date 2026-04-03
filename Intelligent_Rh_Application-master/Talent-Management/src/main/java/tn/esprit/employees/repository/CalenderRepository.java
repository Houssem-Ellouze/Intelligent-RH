package tn.esprit.employees.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.employees.entity.Calendar;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalenderRepository extends JpaRepository<Calendar, String> {
    List<Calendar> findByMonth(LocalDate month);
}
