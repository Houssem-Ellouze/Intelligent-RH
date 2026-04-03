package tn.esprit.scoutisme;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.scoutisme.Controller.ScoutingController;
import tn.esprit.scoutisme.DTO.CandidatDTO;
import tn.esprit.scoutisme.client.CandidatClient;
import tn.esprit.scoutisme.entity.Potentiel;
import tn.esprit.scoutisme.entity.TalentComparison;
import tn.esprit.scoutisme.entity.TalentProfile;
import tn.esprit.scoutisme.service.ComparisonService;
import tn.esprit.scoutisme.service.TalentProfileService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ScoutismeApplicationTests {

    @Mock private TalentProfileService talentProfileService;
    @Mock private ComparisonService comparisonService;
    @Mock private CandidatClient candidatClient;

    @InjectMocks
    private ScoutingController controller;

    private MockMvc mockMvc;

    private TalentProfile profileA;
    private TalentProfile profileB;
    private CandidatDTO candidatDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        // ✅ Utilisation directe des constantes enum
        profileA = new TalentProfile();
        profileA.setId(1L);
        profileA.setCandidatId(10L);
        profileA.setScoreGlobal(88.5);
        profileA.setPotentiel(Potentiel.ELEVE);

        profileB = new TalentProfile();
        profileB.setId(2L);
        profileB.setCandidatId(20L);
        profileB.setScoreGlobal(72.0);
        profileB.setPotentiel(Potentiel.MOYEN);

        candidatDTO = new CandidatDTO();
        candidatDTO.setPrenom("Ahmed");
        candidatDTO.setNom("Ben Ali");
    }

    // ─────────────────────────────────────────────
    // GET /api/scouting/all
    // ─────────────────────────────────────────────

    @Test
    void hello_shouldReturnHelloMessage() throws Exception {
        mockMvc.perform(get("/api/scouting/all"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello scoutisme"));
    }

    // ─────────────────────────────────────────────
    // POST /api/scouting/profile  (multipart)
    // ─────────────────────────────────────────────

    @Test
    void createOrUpdateProfile_shouldReturn200WithoutCv() throws Exception {
        when(talentProfileService.createOrUpdateProfileFromCandidat(
                eq("Ahmed"), eq("Ben Ali"), isNull()))
                .thenReturn(profileA);

        mockMvc.perform(multipart("/api/scouting/profile")
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.scoreGlobal").value(88.5));

        verify(talentProfileService)
                .createOrUpdateProfileFromCandidat(eq("Ahmed"), eq("Ben Ali"), isNull());
    }

    @Test
    void createOrUpdateProfile_shouldReturn200WithCv() throws Exception {
        MockMultipartFile cvFile = new MockMultipartFile(
                "cv", "cv.pdf", "application/pdf", "fake-pdf".getBytes()
        );

        when(talentProfileService.createOrUpdateProfileFromCandidat(
                eq("Ahmed"), eq("Ben Ali"), any()))
                .thenReturn(profileA);

        mockMvc.perform(multipart("/api/scouting/profile")
                        .file(cvFile)
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isOk())
                // ✅ "ÉLEVÉ" → "ELEVE"
                .andExpect(jsonPath("$.potentiel").value("ELEVE"));
    }

    @Test
    void createOrUpdateProfile_shouldReturn404WhenCandidatNotFound() throws Exception {
        when(talentProfileService.createOrUpdateProfileFromCandidat(
                eq("Inconnu"), eq("Inconnu"), any()))
                .thenThrow(new IllegalArgumentException("Candidat introuvable"));

        mockMvc.perform(multipart("/api/scouting/profile")
                        .param("prenom", "Inconnu")
                        .param("nom", "Inconnu"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Candidat introuvable"));
    }

    @Test
    void createOrUpdateProfile_shouldReturn500OnUnexpectedError() throws Exception {
        when(talentProfileService.createOrUpdateProfileFromCandidat(
                any(), any(), any()))
                .thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(multipart("/api/scouting/profile")
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Erreur interne serveur"));
    }

    // ─────────────────────────────────────────────
    // GET /api/scouting/profile/score
    // ─────────────────────────────────────────────

    @Test
    void getProfileScore_shouldReturnScoreAndPotentiel() throws Exception {
        when(talentProfileService.getLatestProfileByFullName("Ahmed", "Ben Ali"))
                .thenReturn(profileA);

        mockMvc.perform(get("/api/scouting/profile/score")
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prenom").value("Ahmed"))
                .andExpect(jsonPath("$.nom").value("Ben Ali"))
                .andExpect(jsonPath("$.scoreGlobal").value(88.5))
                // ✅ "ÉLEVÉ" → "ELEVE"
                .andExpect(jsonPath("$.potentiel").value("ELEVE"));

        verify(talentProfileService).getLatestProfileByFullName("Ahmed", "Ben Ali");
    }

    @Test
    void getProfileScore_shouldReturn404WhenProfileNotFound() throws Exception {
        when(talentProfileService.getLatestProfileByFullName("Inconnu", "Inconnu"))
                .thenThrow(new RuntimeException("Profil introuvable"));

        mockMvc.perform(get("/api/scouting/profile/score")
                        .param("prenom", "Inconnu")
                        .param("nom", "Inconnu"))
                .andExpect(status().isNotFound());
    }

    // ─────────────────────────────────────────────
    // POST /api/scouting/compare
    // ─────────────────────────────────────────────

    @Test
    void compareByFullName_shouldReturnComparison() throws Exception {
        TalentComparison comparison = new TalentComparison();

        when(talentProfileService.getLatestProfileByFullName("Ahmed", "Ben Ali"))
                .thenReturn(profileA);
        when(talentProfileService.getLatestProfileByFullName("Sana", "Trabelsi"))
                .thenReturn(profileB);
        when(comparisonService.compare(1L, 2L)).thenReturn(comparison);

        mockMvc.perform(post("/api/scouting/compare")
                        .param("prenomA", "Ahmed").param("nomA", "Ben Ali")
                        .param("prenomB", "Sana").param("nomB", "Trabelsi"))
                // ✅ vérifier juste le status 200, sans supposer les champs de TalentComparison
                .andExpect(status().isOk());

        verify(comparisonService).compare(1L, 2L);
    }

    @Test
    void compareByFullName_shouldReturn400OnError() throws Exception {
        when(talentProfileService.getLatestProfileByFullName(any(), any()))
                .thenThrow(new RuntimeException("Profil introuvable"));

        mockMvc.perform(post("/api/scouting/compare")
                        .param("prenomA", "X").param("nomA", "X")
                        .param("prenomB", "Y").param("nomB", "Y"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Erreur comparaison"));
    }

    // ─────────────────────────────────────────────
    // GET /api/scouting/profiles
    // ─────────────────────────────────────────────

    @Test
    void getAllProfiles_shouldReturn200WithProfiles() throws Exception {
        when(talentProfileService.getAllTalentProfiles()).thenReturn(List.of(profileA, profileB));

        mockMvc.perform(get("/api/scouting/profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getAllProfiles_shouldReturn204WhenEmpty() throws Exception {
        when(talentProfileService.getAllTalentProfiles()).thenReturn(List.of());

        mockMvc.perform(get("/api/scouting/profiles"))
                .andExpect(status().isNoContent());
    }

    // ─────────────────────────────────────────────
    // GET /api/scouting/ranking
    // ─────────────────────────────────────────────

    @Test
    void getTalentRanking_shouldReturnRankedListWithCandidatInfo() throws Exception {
        when(talentProfileService.getAllTalentProfiles()).thenReturn(List.of(profileA, profileB));
        when(candidatClient.getById(10L)).thenReturn(candidatDTO);

        CandidatDTO candidat2 = new CandidatDTO();
        candidat2.setPrenom("Sana");
        candidat2.setNom("Trabelsi");
        when(candidatClient.getById(20L)).thenReturn(candidat2);

        mockMvc.perform(get("/api/scouting/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[0].scoreGlobal").value(88.5))
                .andExpect(jsonPath("$[0].prenom").value("Ahmed"))
                .andExpect(jsonPath("$[1].rank").value(2))
                .andExpect(jsonPath("$[1].prenom").value("Sana"));
    }

    @Test
    void getTalentRanking_shouldReturn204WhenNoProfilesWithScore() throws Exception {
        TalentProfile noScore = new TalentProfile();
        noScore.setScoreGlobal(null);

        when(talentProfileService.getAllTalentProfiles()).thenReturn(List.of(noScore));

        mockMvc.perform(get("/api/scouting/ranking"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getTalentRanking_shouldFallbackToErreurWhenFeignFails() throws Exception {
        when(talentProfileService.getAllTalentProfiles()).thenReturn(List.of(profileA));
        when(candidatClient.getById(10L)).thenThrow(new RuntimeException("Feign error"));

        mockMvc.perform(get("/api/scouting/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].prenom").value("Erreur"))
                .andExpect(jsonPath("$[0].nom").value("Erreur"));
    }

    // ─────────────────────────────────────────────
    // PATCH /api/scouting/profile/cv  (multipart)
    // ─────────────────────────────────────────────

    @Test
    void updateProfileCV_shouldReturn200WithUpdatedProfile() throws Exception {
        MockMultipartFile cvFile = new MockMultipartFile(
                "cv", "nouveau_cv.pdf", "application/pdf", "updated-pdf".getBytes()
        );

        when(talentProfileService.createOrUpdateProfileFromCandidat(
                eq("Ahmed"), eq("Ben Ali"), any()))
                .thenReturn(profileA);

        mockMvc.perform(multipart("/api/scouting/profile/cv")
                        .file(cvFile)
                        .with(req -> { req.setMethod("PATCH"); return req; })
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scoreGlobal").value(88.5));
    }

    @Test
    void updateProfileCV_shouldReturn400WhenCvMissing() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "cv", "", "application/pdf", new byte[0]
        );

        mockMvc.perform(multipart("/api/scouting/profile/cv")
                        .file(emptyFile)
                        .with(req -> { req.setMethod("PATCH"); return req; })
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Le fichier CV est obligatoire"));
    }

    @Test
    void updateProfileCV_shouldReturn404WhenCandidatNotFound() throws Exception {
        MockMultipartFile cvFile = new MockMultipartFile(
                "cv", "cv.pdf", "application/pdf", "pdf".getBytes()
        );

        when(talentProfileService.createOrUpdateProfileFromCandidat(
                any(), any(), any()))
                .thenThrow(new IllegalArgumentException("Candidat introuvable"));

        mockMvc.perform(multipart("/api/scouting/profile/cv")
                        .file(cvFile)
                        .with(req -> { req.setMethod("PATCH"); return req; })
                        .param("prenom", "Inconnu")
                        .param("nom", "Inconnu"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Candidat introuvable"));
    }

    // ─────────────────────────────────────────────
    // GET /api/scouting/profiles/search
    // ─────────────────────────────────────────────

    @Test
    void searchProfiles_shouldReturnMatchingProfiles() throws Exception {
        when(talentProfileService.searchProfiles(70.0, 90.0, "Java"))
                .thenReturn(List.of(profileA));
        when(candidatClient.getById(10L)).thenReturn(candidatDTO);

        mockMvc.perform(get("/api/scouting/profiles/search")
                        .param("minScore", "70.0")
                        .param("maxScore", "90.0")
                        .param("keyword", "Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].scoreGlobal").value(88.5))
                .andExpect(jsonPath("$[0].prenom").value("Ahmed"));
    }

    @Test
    void searchProfiles_shouldReturn204WhenNoResults() throws Exception {
        when(talentProfileService.searchProfiles(any(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/scouting/profiles/search"))
                .andExpect(status().isNoContent());
    }

    @Test
    void searchProfiles_shouldReturn500OnServiceError() throws Exception {
        when(talentProfileService.searchProfiles(any(), any(), any()))
                .thenThrow(new RuntimeException("DB crash"));

        mockMvc.perform(get("/api/scouting/profiles/search"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$[0].error").value("Erreur interne serveur"));
    }

    @Test
    void searchProfiles_shouldFallbackToErreurWhenFeignFails() throws Exception {
        when(talentProfileService.searchProfiles(any(), any(), any()))
                .thenReturn(List.of(profileA));
        when(candidatClient.getById(10L)).thenThrow(new RuntimeException("Feign error"));

        mockMvc.perform(get("/api/scouting/profiles/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].prenom").value("Erreur"))
                .andExpect(jsonPath("$[0].nom").value("Erreur"));
    }
}