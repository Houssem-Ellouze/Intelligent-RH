package tn.esprit.scoutisme.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompetenceDTO {
    private Long id;
    private String libelle;
    private String niveauDeclare;
    private String type;
}
