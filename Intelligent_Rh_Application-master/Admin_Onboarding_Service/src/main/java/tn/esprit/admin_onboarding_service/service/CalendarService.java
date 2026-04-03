package tn.esprit.admin_onboarding_service.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.admin_onboarding_service.entity.Appointment;
import tn.esprit.admin_onboarding_service.entity.Calendar;
import tn.esprit.admin_onboarding_service.repository.CalendarRepository;


import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarRepository calendarRepository;

    // Crée ou récupère un calendrier pour un mois donné
    public Calendar getOrCreateCalendar(LocalDate month) {
        return calendarRepository.findByMonth(month)
                .orElseGet(() -> {
                    Calendar c = new Calendar();
                    c.setMonth(month);
                    return calendarRepository.save(c);
                });
    }

    // Ajoute un rendez-vous à un calendrier
    public Appointment addAppointment(LocalDate date, LocalTime start, LocalTime end, String title) {
        Calendar calendar = getOrCreateCalendar(date.withDayOfMonth(1));

        Appointment appt = new Appointment();
        appt.setTitle(title);
        appt.setDate(date);
        appt.setStartTime(start);
        appt.setEndTime(end);
        appt.setCalendar(calendar);

        calendar.getAppointments().add(appt);
        calendarRepository.save(calendar); // Cascade save
        return appt;
    }

    // Récupère tous les rendez-vous d’un mois
    public List<Appointment> getAppointmentsByMonth(LocalDate month) {
        Calendar calendar = calendarRepository.findByMonth(month).orElse(null);
        return (calendar != null) ? calendar.getAppointments() : List.of();
    }
}
