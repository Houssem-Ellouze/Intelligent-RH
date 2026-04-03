package tn.esprit.scoutisme.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "talent_comparison")
public class TalentComparison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double scoreA;
    private Double scoreB;

    @ManyToOne
    @JoinColumn(name = "talentA_id")
    // ICI : On ignore les champs qui causent le Lazy Initialization Error
    @JsonIgnoreProperties({"skills", "badges", "evaluationScout", "hibernateLazyInitializer", "handler"})
    private TalentProfile talentA;

    @ManyToOne
    @JoinColumn(name = "talentB_id")
    @JsonIgnoreProperties({"skills", "badges", "evaluationScout", "hibernateLazyInitializer", "handler"})
    private TalentProfile talentB;

    private String winner;
}