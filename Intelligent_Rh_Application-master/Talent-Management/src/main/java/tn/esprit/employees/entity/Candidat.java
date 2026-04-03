package tn.esprit.employees.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "candidats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Candidat implements UserDetails, Principal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(name = "account_locked", nullable = false)
    private boolean accountLocked = false;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;

    @Column(unique = true, nullable = false)
    private String telephone;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(nullable = false)
    private Boolean enabled = false;

    // CV optionnel
    @Column(name = "file_name")
    private String fileName;

    @Column(name = "lien_cv")
    private String lienCV;

    private String lienLinkedin;

    private String lienGitHub;

    private Integer anneesExperience;

    @Column(nullable = false)
    private boolean consentementDonnees = false;

    @Column(nullable = true)
    private String posteActuel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private DomainePrincipale domainePrincipale;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Speciality speciality;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(nullable = true)
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }

    @OneToMany(
            mappedBy = "candidat",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Competence> competences = new ArrayList<>();

    // ================= SECURITY =================

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return speciality.getAuthorities();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return !accountLocked;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return false;
    }

    // ================= METHODS =================

    public void addCompetence(Competence competence) {
        competences.add(competence);
        competence.setCandidat(this);
    }

    public void removeCompetence(Competence competence) {
        competences.remove(competence);
        competence.setCandidat(null);
    }

    public String getNomComplet() {
        return nom + " " + prenom;
    }

    @Override
    public String getName() {
        return getNomComplet();
    }
}
