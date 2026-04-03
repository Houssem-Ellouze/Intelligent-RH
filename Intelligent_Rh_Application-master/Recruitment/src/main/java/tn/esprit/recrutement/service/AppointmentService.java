package tn.esprit.recrutement.service;

import org.springframework.stereotype.Service;
import tn.esprit.recrutement.entity.Appointment;
import tn.esprit.recrutement.repository.AppointmentRepository;


import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository repository;

    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    public List<Appointment> findAll() {
        return repository.findAll();
    }

    public Optional<Appointment> findById(String id) {
        return repository.findById(id);
    }

    public Appointment save(Appointment appointment) {
        return repository.save(appointment);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
