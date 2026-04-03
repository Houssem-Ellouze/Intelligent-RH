package tn.esprit.recrutement.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "entretiens")
public class Entretien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateHeure;
    private String intervieweur;

    @Column(length = 1000)
    private String feedbackTechnique;

    private Integer noteGlobale;

    @ManyToOne
    @JoinColumn(name = "candidature_id")
    @JsonBackReference // ✅ Évite la boucle infinie JSON
    private Candidature candidature;
}