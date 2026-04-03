package tn.esprit.employees.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "competences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Vérifiez que c'est bien IDENTITY
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeCompetence type; // HARD_SKILL ou SOFT_SKILL

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauExpertise niveauDeclare; // DEBUTANT, INTERMEDIAIRE, EXPERT

    @Column(nullable = false)
    private String libelle;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private DomainePrincipale domainePrincipale;


    @ManyToOne
    @JoinColumn(name = "candidat_id")
    @JsonBackReference // <--- AJOUTE CECI pour couper la boucle avec @JsonManagedReference dans Candidat
    private Candidat candidat;

}
