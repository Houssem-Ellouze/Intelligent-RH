package tn.esprit.recrutement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class OffreEmploi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(length = 1000)
    private String description;

    private LocalDate datePublication;

    @Enumerated(EnumType.STRING)
    private StatutOffre statut;

    @OneToMany(mappedBy = "offre", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Candidature> candidatures;
}