package tn.esprit.admin_onboarding_service.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tn.esprit.admin_onboarding_service.entity.*;
import tn.esprit.admin_onboarding_service.repository.CollaborateurRepository;
import tn.esprit.admin_onboarding_service.repository.DepartementRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private static final Logger log = LoggerFactory.getLogger(OnboardingService.class);
    private final CollaborateurRepository collaborateurRepository;
    private final DepartementRepository departementRepository;
    private final CalendarService calendarService; // ← injection du service calendrier

    /**
     * Récupère la liste de tous les collaborateurs (utilisé pour les étapes 2 et 3)
     */
    public List<Collaborateur> recupererTousLesCollaborateurs() {
        return collaborateurRepository.findAll();
    }

    /**
     * TRANSFORMATION : Crée un nouveau collaborateur à partir des données reçues d'Angular.
     * On ajoute nom et prenom en paramètres pour éviter de récupérer des données erronées via Feign.
     */
    @Transactional
    public void transformerCandidatEnCollaborateur(Long candidatureId, String metier, String nom, String prenom) {
        log.info("🚀 Transformation demandée pour : {} {} (ID Candidature: {})", prenom, nom, candidatureId);

        Collaborateur collab = new Collaborateur();

        // On utilise les données directes pour garantir que c'est le bon candidat (Houssem et non Yassine)
        collab.setNom(nom);
        collab.setPrenom(prenom);

        // Génération d'un matricule unique
        collab.setMatricule("MAT-" + candidatureId + "-" + (System.currentTimeMillis() % 1000));

        // Création de l'email professionnel
        String email = (prenom + "." + nom).toLowerCase().replace(" ", "") + "@esprit.tn";
        collab.setEmailPro(email);

        collab.setStatutOnboarding(StatutIntegration.EN_COURS);
        collab.setTaches(new ArrayList<>());

        // --- MAPPAGE DES MÉTIERS ET CONFIGURATION ---
        String m = (metier != null) ? metier.toUpperCase() : "AUTRE";

        switch (m) {
            case "DEVELOPPEMENT_WEB":
            case "MOBILE":
                configurerContrat(collab, 4200.0, "CDI");
                affecterDepartement(collab, "Pôle Développement");
                ajouterTache(collab, "PC Performance", "IT");
                ajouterTache(collab, "Accès GitLab/Jira", "DevOps");
                break;

            case "CLOUD":
            case "DEVOPS":
                configurerContrat(collab, 5000.0, "CDI");
                affecterDepartement(collab, "Infrastructure & Cloud");
                ajouterTache(collab, "Accès AWS/Azure", "Admin");
                ajouterTache(collab, "Badge Salle Serveur", "Sécurité");
                break;

            case "DATA_SCIENCE":
            case "INTELLIGENCE_ARTIFICIELLE":
                configurerContrat(collab, 4800.0, "CDI");
                affecterDepartement(collab, "Data Lab");
                ajouterTache(collab, "Configuration Cluster GPU", "IT");
                break;

            case "CYBERSECURITE":
                configurerContrat(collab, 5500.0, "CDI");
                affecterDepartement(collab, "Sécurité SI");
                ajouterTache(collab, "Habilitation Confidentielle", "RH");
                break;

            case "DESIGN_UX_UI":
                configurerContrat(collab, 3800.0, "CDI");
                affecterDepartement(collab, "Produit & Design");
                ajouterTache(collab, "Licence Adobe/Figma", "Design");
                break;

            case "TEST_ET_QA":
                configurerContrat(collab, 3600.0, "CDD");
                affecterDepartement(collab, "Qualité Logicielle");
                ajouterTache(collab, "Environnement de Test", "QA");
                break;

            default:
                configurerContrat(collab, 3000.0, "CDD");
                affecterDepartement(collab, "Services Généraux");
                ajouterTache(collab, "Kit de Bienvenue", "RH");
                break;
        }

        collaborateurRepository.save(collab);
        log.info("✅ Collaborateur créé avec succès : {}", collab.getMatricule());
    }

    /**
     * FINALISATION : Clôture le processus d'onboarding (Étape 3)
     */
    @Transactional
    public void finaliserOnboarding(Long collaborateurId) {
        Collaborateur collab = collaborateurRepository.findById(collaborateurId)
                .orElseThrow(() -> new EntityNotFoundException("Collaborateur introuvable"));

        // Marquer toutes les tâches d'intégration comme terminées
        if (collab.getTaches() != null) {
            collab.getTaches().forEach(t -> t.setEstRealisee(true));
        }

        collab.setStatutOnboarding(StatutIntegration.TERMINE);
        collaborateurRepository.save(collab);
        log.info("🏁 Onboarding finalisé pour {}", collab.getNom());
    }

    // --- MÉTHODES UTILITAIRES PRIVÉES ---

    private void ajouterTache(Collaborateur collab, String libelle, String resp) {
        TacheIntegration tache = new TacheIntegration();
        tache.setLibelle(libelle);
        tache.setResponsableTache(resp);
        tache.setEstRealisee(false);

        // Date d’échéance : par exemple, 1 jour après la création
        LocalDate dateEcheance = LocalDate.now().plusDays(1);
        tache.setDateEcheance(java.sql.Date.valueOf(dateEcheance));

        tache.setCollaborateur(collab);
        collab.getTaches().add(tache);

        // Création automatique d’un RDV pour le calendrier
        calendarService.addAppointment(
                dateEcheance,
                java.time.LocalTime.of(9, 0),
                java.time.LocalTime.of(10, 0),
                collab.getNom() + " " + collab.getPrenom() + " : " + libelle
        );
    }


    private void configurerContrat(Collaborateur collab, Double salaire, String type) {
        Contrat contrat = new Contrat();
        contrat.setSalaireBrut(salaire);
        contrat.setDateDebut(LocalDate.now().plusDays(15));
        contrat.setDureePeriodeEssai(3);
        contrat.setTypeContrat(type);
        collab.setContrat(contrat);
    }

    private void affecterDepartement(Collaborateur collab, String nomDept) {
        Departement dept = departementRepository.findFirstByNomContaining(nomDept)
                .orElseGet(() -> {
                    Departement d = new Departement();
                    d.setNom(nomDept);
                    d.setResponsableNom("Manager " + nomDept);
                    return departementRepository.save(d);
                });
        collab.setDepartement(dept);
    }
    public Map<String, Object> getDashboardStats() {
        List<Collaborateur> collaborateurs = collaborateurRepository.findAll();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        // 1️⃣ Nombre de collaborateurs par mois (basé sur la date de création du collaborateur)
        Map<String, Long> collaborateursParMois = collaborateurs.stream()
                .collect( Collectors.groupingBy(
                        c -> c.getContrat() != null
                                ? c.getContrat().getDateDebut().format(formatter)
                                : "Non défini",
                        Collectors.counting()
                ));

        // 2️⃣ Moyenne de tâches par collaborateur par mois
        Map<String, Double> moyenneTachesParMois = collaborateurs.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getContrat() != null
                                ? c.getContrat().getDateDebut().format(formatter)
                                : "Non défini",
                        Collectors.averagingInt(c -> c.getTaches() != null ? c.getTaches().size() : 0)
                ));

        // 3️⃣ Répartition des collaborateurs par nombre de tâches
        Map<String, Long> collaborateursParTaille = collaborateurs.stream()
                .collect(Collectors.groupingBy(
                        c -> {
                            int size = c.getTaches() != null ? c.getTaches().size() : 0;
                            if (size <= 3) return "Petit (<=3)";
                            else if (size <= 6) return "Moyen (4-6)";
                            else return "Grand (>6)";
                        },
                        Collectors.counting()
                ));

        // Compilation des stats
        Map<String, Object> stats = new HashMap<> ();
        stats.put("collaborateursParMois", collaborateursParMois);
        stats.put("moyenneTachesParMois", moyenneTachesParMois);
        stats.put("collaborateursParTaille", collaborateursParTaille);
        stats.put("totalCollaborateurs", collaborateurs.size());

        return stats;
    }
}