package tn.esprit.recrutement.DTO;

import lombok.*;
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


    // Correction ici : On utilise une liste d'objets et non de String
    private List<CompetenceDTO> competences;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class CompetenceDTO {
    private Long id;
    private String libelle;
    private String niveauDeclare;
    private String type;
}