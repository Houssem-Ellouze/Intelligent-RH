package tn.esprit.recrutement.controller;


import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.recrutement.entity.Appointment;
import tn.esprit.recrutement.service.AppointmentService;


import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/recrutement/appointments")
@Slf4j
@AllArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointment(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            if (appointment.getDate() == null || appointment.getStartTime() == null || appointment.getEndTime() == null) {
                return ResponseEntity.badRequest().body("Required fields are missing");
            }
            Appointment saved = service.save(appointment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error creating appointment", e);
            return ResponseEntity.internalServerError().body("Error creating appointment: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable String id, @RequestBody Appointment updated) {
        log.info("Request received: UPDATE appointment with id {}", id);
        Optional<Appointment> existingOpt = service.findById(id);
        if (existingOpt.isPresent()) {
            Appointment existing = existingOpt.get();
            existing.setTitle(updated.getTitle());
            existing.setStartTime(updated.getStartTime());
            existing.setEndTime(updated.getEndTime());
            existing.setDate(updated.getDate());

            Appointment saved = service.save(existing);
            log.info("Appointment with id {} updated successfully", id);
            return ResponseEntity.ok(saved);
        } else {
            log.warn("Appointment with id {} NOT found for update", id);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}