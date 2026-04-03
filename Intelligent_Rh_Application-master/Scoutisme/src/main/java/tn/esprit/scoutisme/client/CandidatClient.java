package tn.esprit.scoutisme.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.scoutisme.DTO.CandidatDTO;

import java.util.List;

@FeignClient(name = "talent-management-service", url = "${app.services.url}")
public interface CandidatClient {

    @GetMapping("/api/candidats/{id}")
    CandidatDTO getById(@PathVariable("id") Long id);

    @GetMapping("/api/candidats/search")
    CandidatDTO getByFullIdentity(
            @RequestParam("prenom") String prenom,
            @RequestParam("nom") String nom);

    // CORRECTION: Retirer @RequestBody pour un PUT multipart
    // Si vous voulez juste mettre à jour avec JSON, retirez consumes
    @PutMapping("/api/candidats/{id}")
    CandidatDTO update(@PathVariable("id") Long id, @RequestBody CandidatDTO candidat);

    @GetMapping("/api/candidats")
    ResponseEntity<List<CandidatDTO>> getAll();
}