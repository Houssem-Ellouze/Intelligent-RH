package tn.esprit.recrutement.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import tn.esprit.recrutement.DTO.CandidatDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "candidatures")
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidatId;
    private Integer noteRH;
    private String commentaireRH;

    @ManyToOne
    @JoinColumn(name = "offre_id")
    @JsonIgnoreProperties("candidatures") // ✅ Affiche l'offre mais ignore la liste de candidats dedans
    private OffreEmploi offre;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime datePostulation;

    @Enumerated(EnumType.STRING)
    private EtatCandidature etat;

    @OneToMany(mappedBy = "candidature", fetch = FetchType.LAZY)
    @JsonManagedReference // ✅ Complémentaire à @JsonBackReference
    private List<Entretien> entretiens;

    @Transient
    private CandidatDTO infos_candidat;

    @PrePersist
    protected void onCreate() {
        if (this.datePostulation == null) {
            this.datePostulation = LocalDateTime.now();
        }
        if (this.etat == null) {
            this.etat = EtatCandidature.NOUVELLE;
        }
    }
}