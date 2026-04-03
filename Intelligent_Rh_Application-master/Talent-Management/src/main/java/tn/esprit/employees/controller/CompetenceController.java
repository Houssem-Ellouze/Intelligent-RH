package tn.esprit.employees.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.employees.entity.Competence;
import tn.esprit.employees.repository.ICompetenceService;

import java.util.List;

@RestController
@RequestMapping("/api/competences")
@RequiredArgsConstructor
public class CompetenceController {

    private final ICompetenceService competenceService;

    @GetMapping("/candidat/{candidatId}")
    public ResponseEntity<List<Competence>> getByCandidat(@PathVariable Long candidatId) {
        return ResponseEntity.ok(competenceService.getCompetencesByCandidatId(candidatId));
    }

}