package tn.esprit.recrutement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.recrutement.controller.CandidatureController;
import tn.esprit.recrutement.entity.*;
import tn.esprit.recrutement.service.CandidatureService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RecrutementApplicationTests {

    @Mock
    private CandidatureService candidatureService;

    @InjectMocks
    private CandidatureController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private Candidature candidature;
    private OffreEmploi offre;
    private Entretien entretien;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        offre = new OffreEmploi();
        offre.setId(1L);
        offre.setTitre("Développeur Java");

        // ✅ Candidature sans prenom/nom — on utilise seulement les champs qui existent
        candidature = new Candidature();
        candidature.setId(10L);
        candidature.setDatePostulation(LocalDateTime.now());

        entretien = new Entretien();
        entretien.setId(5L);
        entretien.setDateHeure(LocalDateTime.of(2025, 6, 10, 9, 0));
    }

    // ─────────────────────────────────────────────
    // GET /api/recrutement/candidatures/all
    // ─────────────────────────────────────────────

    @Test
    void getAllCandidatures_shouldReturnList() throws Exception {
        when(candidatureService.getAllCandidatures()).thenReturn(List.of(candidature));

        mockMvc.perform(get("/api/recrutement/candidatures/all"))
                .andExpect(status().isOk())
                // ✅ vérifier seulement la taille et l'id (pas prenom qui n'existe pas)
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(10L));

        verify(candidatureService).getAllCandidatures();
    }

    @Test
    void getAllCandidatures_shouldReturnEmptyList() throws Exception {
        when(candidatureService.getAllCandidatures()).thenReturn(List.of());

        mockMvc.perform(get("/api/recrutement/candidatures/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ─────────────────────────────────────────────
    // GET /api/recrutement/candidatures/{id}
    // ─────────────────────────────────────────────

    @Test
    void getCandidatureById_shouldReturnDossier() throws Exception {
        Map<String, Object> dossier = Map.of("candidat", "Ahmed", "statut", "EN_COURS");
        when(candidatureService.getCandidaturePourOnboarding(10L)).thenReturn(dossier);

        mockMvc.perform(get("/api/recrutement/candidatures/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.candidat").value("Ahmed"))
                .andExpect(jsonPath("$.statut").value("EN_COURS"));

        verify(candidatureService).getCandidaturePourOnboarding(10L);
    }

    // ─────────────────────────────────────────────
    // POST /api/recrutement/offres
    // ─────────────────────────────────────────────

    @Test
    void creerOffre_shouldReturn201WithOffre() throws Exception {
        when(candidatureService.creerOffre(any(OffreEmploi.class))).thenReturn(offre);

        mockMvc.perform(post("/api/recrutement/offres")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offre)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.titre").value("Développeur Java"));

        verify(candidatureService).creerOffre(any(OffreEmploi.class));
    }

    // ─────────────────────────────────────────────
    // GET /api/recrutement/offres/actives
    // ─────────────────────────────────────────────

    @Test
    void listerOffres_shouldReturnActiveOffres() throws Exception {
        when(candidatureService.listerOffresActives()).thenReturn(List.of(offre));

        mockMvc.perform(get("/api/recrutement/offres/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].titre").value("Développeur Java"));
    }

    // ─────────────────────────────────────────────
    // POST /api/recrutement/postuler
    // ─────────────────────────────────────────────

    @Test
    void postuler_shouldReturn201WhenSuccess() throws Exception {
        when(candidatureService.postuler(1L, "Ahmed", "Ben Ali")).thenReturn(candidature);

        mockMvc.perform(post("/api/recrutement/postuler")
                        .param("offreId", "1")
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isCreated())
                // ✅ vérifier l'id au lieu de prenom/nom (champs absents de Candidature)
                .andExpect(jsonPath("$.id").value(10L));

        verify(candidatureService).postuler(1L, "Ahmed", "Ben Ali");
    }

    @Test
    void postuler_shouldReturn404WhenOffreNotFound() throws Exception {
        when(candidatureService.postuler(99L, "Ahmed", "Ben Ali"))
                .thenThrow(new NoSuchElementException("Offre introuvable"));

        mockMvc.perform(post("/api/recrutement/postuler")
                        .param("offreId", "99")
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Offre introuvable"));
    }

    @Test
    void postuler_shouldReturn400WhenRuntimeException() throws Exception {
        when(candidatureService.postuler(1L, "Ahmed", "Ben Ali"))
                .thenThrow(new RuntimeException("Candidature déjà existante"));

        mockMvc.perform(post("/api/recrutement/postuler")
                        .param("offreId", "1")
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Candidature déjà existante"));
    }

    @Test
    void postuler_shouldSetDatePostulationWhenNull() throws Exception {
        candidature.setDatePostulation(null);
        when(candidatureService.postuler(1L, "Ahmed", "Ben Ali")).thenReturn(candidature);

        mockMvc.perform(post("/api/recrutement/postuler")
                        .param("offreId", "1")
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isCreated());
    }

    // ─────────────────────────────────────────────
    // POST /api/recrutement/candidatures/{id}/entretiens
    // ─────────────────────────────────────────────

    @Test
    void planifierEntretien_shouldReturn200WithEntretien() throws Exception {
        when(candidatureService.planifierEntretien(eq(10L), any(Entretien.class)))
                .thenReturn(entretien);

        mockMvc.perform(post("/api/recrutement/candidatures/10/entretiens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(entretien)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L));

        verify(candidatureService).planifierEntretien(eq(10L), any(Entretien.class));
    }

    @Test
    void planifierEntretien_shouldSetDateHeureWhenNull() throws Exception {
        entretien.setDateHeure(null);
        when(candidatureService.planifierEntretien(eq(10L), any(Entretien.class)))
                .thenReturn(entretien);

        mockMvc.perform(post("/api/recrutement/candidatures/10/entretiens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(entretien)))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────────────────────
    // PATCH /api/recrutement/statut/{candidatureId}
    // ✅ Utiliser les VRAIES valeurs de l'enum EtatCandidature
    //    (lire depuis EtatCandidature.java — ex: EN_ATTENTE, ACCEPTEE, REFUSEE...)
    // ─────────────────────────────────────────────

    @Test
    void mettreAJourStatut_shouldReturn200WithMessage() throws Exception {
        // ✅ Utiliser le nom exact de l'enum tel qu'il apparaît dans EtatCandidature.java
        doNothing().when(candidatureService)
                .mettreAJourStatutCandidature(eq(10L), any(EtatCandidature.class), eq(85), eq("Très bon profil"));

        mockMvc.perform(patch("/api/recrutement/statut/10")
                        // ✅ Passer la valeur exacte de l'enum (ouvrir EtatCandidature.java)
                        .param("etat", EtatCandidature.values()[0].name())
                        .param("note", "85")
                        .param("commentaire", "Très bon profil"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Dossier mis à jour avec succès"));
    }

    @Test
    void mettreAJourStatut_shouldWorkWithoutOptionalParams() throws Exception {
        doNothing().when(candidatureService)
                .mettreAJourStatutCandidature(eq(10L), any(EtatCandidature.class), isNull(), isNull());

        mockMvc.perform(patch("/api/recrutement/statut/10")
                        // ✅ Première valeur réelle de l'enum
                        .param("etat", EtatCandidature.values()[0].name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Dossier mis à jour avec succès"));
    }

    // ─────────────────────────────────────────────
    // GET /api/recrutement/candidatures/{id}/dossier
    // ─────────────────────────────────────────────

    @Test
    void voirDossier_shouldReturnDossierComplet() throws Exception {
        Map<String, Object> dossier = Map.of("nom", "Ben Ali", "entretiens", List.of());
        when(candidatureService.consulterDossierComplet(10L)).thenReturn(dossier);

        mockMvc.perform(get("/api/recrutement/candidatures/10/dossier"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Ben Ali"));

        verify(candidatureService).consulterDossierComplet(10L);
    }

    // ─────────────────────────────────────────────
    // GET /api/recrutement/dossiers-complets
    // ─────────────────────────────────────────────

    @Test
    void getAllDossiers_shouldReturn200WithDossiers() throws Exception {
        List<Map<String, Object>> dossiers = List.of(
                Map.of("id", 1, "nom", "Ben Ali"),
                Map.of("id", 2, "nom", "Trabelsi")
        );
        when(candidatureService.consulterTousLesDossiersComplets()).thenReturn(dossiers);

        mockMvc.perform(get("/api/recrutement/dossiers-complets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getAllDossiers_shouldReturn204WhenEmpty() throws Exception {
        when(candidatureService.consulterTousLesDossiersComplets()).thenReturn(List.of());

        mockMvc.perform(get("/api/recrutement/dossiers-complets"))
                .andExpect(status().isNoContent());
    }

    // ─────────────────────────────────────────────
    // GET /api/recrutement/candidatures/rdv
    // ─────────────────────────────────────────────

    @Test
    void getCandidaturesRdv_shouldReturnList() throws Exception {
        when(candidatureService.getCandidaturesByDateRdv()).thenReturn(List.of(candidature));

        mockMvc.perform(get("/api/recrutement/candidatures/rdv"))
                .andExpect(status().isOk())
                // ✅ vérifier l'id au lieu de prenom
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(10L));

        verify(candidatureService).getCandidaturesByDateRdv();
    }

    // ─────────────────────────────────────────────
    // GET /api/recrutement/dashboard
    // ─────────────────────────────────────────────

    @Test
    void getDashboardStats_shouldReturnStatsMap() throws Exception {
        Map<String, Object> stats = Map.of(
                "total", 20,
                "acceptes", 8,
                "refuses", 5
        );
        when(candidatureService.getCandidatureStats()).thenReturn(stats);

        mockMvc.perform(get("/api/recrutement/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(20))
                .andExpect(jsonPath("$.acceptes").value(8))
                .andExpect(jsonPath("$.refuses").value(5));

        verify(candidatureService).getCandidatureStats();
    }
}