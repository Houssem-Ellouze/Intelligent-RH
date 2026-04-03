package tn.esprit.recrutement.client;

import org.springframework.stereotype.Component;
import tn.esprit.recrutement.DTO.CandidatDTO;

@Component
public class CandidatClientFallback implements CandidatClient {

    @Override
    public CandidatDTO getById(Long id) {
        // Retourne un objet minimal au lieu de null
        CandidatDTO fallback = new CandidatDTO();
        fallback.setId(id);
        fallback.setNom("Service indisponible");
        fallback.setPrenom("Service indisponible");
        return fallback;
    }

    @Override
    public CandidatDTO getByFullIdentity(String prenom, String nom) {
        CandidatDTO fallback = new CandidatDTO();
        fallback.setNom(nom);
        fallback.setPrenom(prenom);
        return fallback;
    }

    @Override
    public void update(Long id, CandidatDTO candidat) {

    }

}