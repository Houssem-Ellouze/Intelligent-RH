package tn.esprit.scoutisme.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String critere;

    private Double scoreA;
    private Double scoreB;

    private Double difference;

    @ManyToOne
    private TalentComparison comparison;
}
