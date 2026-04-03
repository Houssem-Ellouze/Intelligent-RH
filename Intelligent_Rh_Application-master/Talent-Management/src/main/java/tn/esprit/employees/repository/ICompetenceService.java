package tn.esprit.employees.repository;

import tn.esprit.employees.entity.Competence;

import java.util.List;

public interface ICompetenceService {
    Competence addCompetence(Competence competence);
    Competence updateCompetence(Competence competence);
    void deleteCompetence(Long id);
    Competence getCompetenceById(Long id);
    List<Competence> getAllCompetences();
    List<Competence> getCompetencesByCandidatId(Long candidatId);
}