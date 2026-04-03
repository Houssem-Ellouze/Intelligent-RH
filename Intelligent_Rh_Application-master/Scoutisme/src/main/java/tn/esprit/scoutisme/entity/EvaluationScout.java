package tn.esprit.scoutisme.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationScout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer leadership;   // 0–100
    private Integer discipline;   // 0–100

    // Optionnel mais recommandé pour la navigation bidirectionnelle
    @OneToOne(mappedBy = "evaluationScout")
    @JsonIgnore // Pour éviter les boucles infinies lors de la sérialisation JSON
    private TalentProfile talentProfile;
}