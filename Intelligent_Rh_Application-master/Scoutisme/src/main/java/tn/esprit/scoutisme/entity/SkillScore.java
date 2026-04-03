package tn.esprit.scoutisme.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class SkillScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String competence;
    @Getter
    private Double score;
    private Double poids;

    @ManyToOne
    @JsonBackReference
    private TalentProfile talentProfile;

    public SkillScore(Long id, String competence, Double score, Double poids, TalentProfile talentProfile) {
        this.id = id;
        this.competence = competence;
        this.score = score;
        this.poids = poids;
        this.talentProfile = talentProfile;
    }

}
