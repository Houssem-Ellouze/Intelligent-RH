package tn.esprit.admin_onboarding_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Departement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String responsableNom;

    @OneToMany(mappedBy = "departement")
    @JsonIgnore // Empêche de ré-afficher la liste des collaborateurs quand on affiche le département
    private List<Collaborateur> collaborateurs;
}