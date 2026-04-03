package tn.esprit.scoutisme.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "talent_profile")
@Getter
@Setter
@ToString(exclude = {"skills", "badges", "evaluationScout"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TalentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidatId;

    private Double scoreGlobal;

    @Enumerated(EnumType.STRING)
    @Column(name = "potentiel", nullable = false)
    private Potentiel potentiel;

    @Column(nullable = false)
    private LocalDate dateEvaluation;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "evaluation_scout_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private EvaluationScout evaluationScout;

    @OneToMany(
            mappedBy = "talentProfile",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE},
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @JsonManagedReference
    // On ignore le profil parent dans SkillScore pour éviter la récursion infinie
    @JsonIgnoreProperties("talentProfile")
    private List<SkillScore> skills = new ArrayList<>();

    @OneToMany(
            cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE},
            fetch = FetchType.LAZY
    )
    @JoinColumn(name = "talent_profile_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<Badge> badges = new ArrayList<>();

    // ... (Le reste de tes méthodes Helper et Lifecycle reste inchangé)

    @PrePersist
    protected void onCreate() {
        if (dateEvaluation == null) dateEvaluation = LocalDate.now();
        if (potentiel == null) potentiel = Potentiel.FAIBLE;
        if (scoreGlobal == null) scoreGlobal = 0.0;
    }

    public void addSkill(SkillScore skill) {
        if (skill == null) return;
        if (skills == null) skills = new ArrayList<>();
        if (!skills.contains(skill)) {
            skills.add(skill);
            skill.setTalentProfile(this);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TalentProfile that = (TalentProfile) o;
        return Objects.equals(id, that.id) && Objects.equals(candidatId, that.candidatId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, candidatId);
    }
}