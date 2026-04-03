package tn.esprit.employees.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.employees.entity.Appointment;
import tn.esprit.employees.entity.Calendar;
import tn.esprit.employees.repository.AppointmentRepository;
import tn.esprit.employees.repository.CalenderRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class CalendarService {

    private final CalenderRepository calendarRepository;
    private final AppointmentRepository appointmentRepository;

    public Calendar createCalendar(LocalDate date) {
        // On s'assure que le calendrier représente toujours le 1er du mois
        LocalDate monthKey = date.withDayOfMonth(1);
        Calendar calendar = new Calendar();
        calendar.setMonth(monthKey);
        log.info("Creating new calendar for month: {}", monthKey);
        return calendarRepository.save(calendar);
    }

    public List<Appointment> getAppointmentsForMonth(LocalDate month) {
        LocalDate start = month.withDayOfMonth(1);
        LocalDate end = month.withDayOfMonth(month.lengthOfMonth());
        log.info("Fetching appointments between {} and {}", start, end);
        return appointmentRepository.findByDateBetween(start, end);
    }

    public List<Calendar> getAllCalendars() {
        return calendarRepository.findAll();
    }

    @Transactional // Important car on effectue potentiellement deux écritures (Calendar + Appointment)
    public Appointment createAppointmentForMonth(Appointment appointment, LocalDate date) {
        LocalDate monthKey = date.withDayOfMonth(1);
        log.info("Processing appointment for month: {}", monthKey);

        // Recherche du calendrier existant ou création d'un nouveau
        Calendar calendar = calendarRepository.findByMonth(monthKey)
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    log.info("No calendar found for month {}, creating new one", monthKey);
                    return createCalendar(monthKey);
                });

        appointment.setCalendar(calendar);
        Appointment saved = appointmentRepository.save(appointment);

        // Note: Assurez-vous que le getter est bien 'getId()' ou 'getUuid()' selon votre entité Appointment
        log.info("Appointment created successfully");
        return saved;
    }

    public void deleteAppointment(String appointmentId) {
        if (appointmentRepository.existsById(appointmentId)) {
            log.info("Deleting appointment with id {}", appointmentId);
            appointmentRepository.deleteById(appointmentId);
        } else {
            log.warn("Appointment with id {} not found, nothing to delete", appointmentId);
        }
    }
}