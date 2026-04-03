package tn.esprit.admin_onboarding_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Collaborateur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String matricule; // Unique d'après le diagramme
    private String nom;
    private String prenom;
    private String emailPro;

    @Enumerated(EnumType.STRING)
    private StatutIntegration statutOnboarding;

    @OneToOne(cascade = CascadeType.ALL) // Ajout du Cascade ici
    private Contrat contrat;

    @ManyToOne(cascade = CascadeType.PERSIST) // Persister le département s'il est nouveau
    private Departement departement;

    @OneToMany(mappedBy = "collaborateur", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TacheIntegration> taches = new ArrayList<>();
}