package tn.esprit.admin_onboarding_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TacheIntegration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Boolean estRealisee;
    private String responsableTache;
    private Date dateEcheance;
    private String libelle;

    @ManyToOne
    @JoinColumn(name = "collaborateur_id")
    @JsonIgnore // CRUCIAL : Empêche la boucle infinie dans le JSON des tâches
    private Collaborateur collaborateur;
}