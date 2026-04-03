package tn.esprit.employees.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.employees.entity.Competence;
import tn.esprit.employees.repository.CompetenceRepository;
import tn.esprit.employees.repository.ICompetenceService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompetenceServiceImpl implements ICompetenceService {

    private final CompetenceRepository competenceRepository;

    @Override
    public Competence addCompetence(Competence competence) {
        return competenceRepository.save(competence);
    }

    @Override
    public Competence updateCompetence(Competence competence) {
        return competenceRepository.save(competence);
    }


    @Override
    public void deleteCompetence(Long id) {
        competenceRepository.deleteById(id);
    }

    @Override
    public Competence getCompetenceById(Long id) {
        return competenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée avec l'id : " + id));
    }

    @Override
    public List<Competence> getAllCompetences() {
        return competenceRepository.findAll();
    }
    @Override
    public List<Competence> getCompetencesByCandidatId(Long candidatId) {
        return competenceRepository.findByCandidatId(candidatId);
    }
}