package tn.esprit.recrutement.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import tn.esprit.recrutement.DTO.CandidatDTO;

@FeignClient(
        name = "TALENT-MANAGEMENT-SERVICE",
        configuration = tn.esprit.recrutement.config.FeignConfig.class,
        fallback = CandidatClientFallback.class  // ✅ Ajout d'un fallback
)
public interface CandidatClient {

    @GetMapping("/api/candidats/{id}")
    CandidatDTO getById(@PathVariable("id") Long id);

    @GetMapping("/api/candidats/search")
    CandidatDTO getByFullIdentity(
            @RequestParam("prenom") String prenom,
            @RequestParam("nom") String nom);

    // Dans votre interface CandidatClient
    @PutMapping(value = "/api/candidats/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    void update(@PathVariable("id") Long id, @RequestBody CandidatDTO candidat);
}