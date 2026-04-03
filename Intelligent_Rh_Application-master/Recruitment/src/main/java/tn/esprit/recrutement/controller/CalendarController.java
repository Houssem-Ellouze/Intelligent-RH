package tn.esprit.recrutement.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.recrutement.entity.Appointment;
import tn.esprit.recrutement.entity.Calendar;
import tn.esprit.recrutement.service.CalendarService;


import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recrutement/calendars")
public class CalendarController {

    private final CalendarService calendarService;

    @PostMapping("/create")
    public ResponseEntity<?> createCalendar(@RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        try {
            Calendar created = calendarService.createCalendar(month);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("Error creating calendar", e);
            return ResponseEntity.internalServerError().body("Error creating calendar: " + e.getMessage());
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointmentsForMonth(@RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        try {
            List<Appointment> appointments = calendarService.getAppointmentsForMonth(month);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            log.error("Error fetching appointments", e);
            return ResponseEntity.internalServerError().body("Error fetching appointments: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCalendars() {
        try {
            List<Calendar> calendars = calendarService.getAllCalendars();
            return ResponseEntity.ok(calendars);
        } catch (Exception e) {
            log.error("Error fetching calendars", e);
            return ResponseEntity.internalServerError().body("Error fetching calendars: " + e.getMessage());
        }
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointmentForMonth(@RequestBody Appointment appointment,
                                                       @RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        try {
            Appointment created = calendarService.createAppointmentForMonth(appointment, month);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("Error creating appointment", e);
            return ResponseEntity.internalServerError().body("Error creating appointment: " + e.getMessage());
        }
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable String id) {
        try {
            calendarService.deleteAppointment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting appointment", e);
            return ResponseEntity.internalServerError().body("Error deleting appointment: " + e.getMessage());
        }
    }
}
