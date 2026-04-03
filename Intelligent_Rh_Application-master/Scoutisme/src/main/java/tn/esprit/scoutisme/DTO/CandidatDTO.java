package tn.esprit.scoutisme.DTO;

import lombok.*;
import tn.esprit.scoutisme.entity.TalentProfile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidatDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String posteActuel;
    private String nomComplet; // Important: présent dans le JSON
    private Integer anneesExperience;
    private String domainePrincipale;
    @Getter
    @Setter
    private Integer NoteRH;
    private String CommentaireRH;
    // Ajout du profil Talent
    private TalentProfile talentProfile;

    // Correction ici : On utilise une liste d'objets et non de String
    private List<CompetenceDTO> competences;
}

