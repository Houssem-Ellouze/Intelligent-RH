package tn.esprit.admin_onboarding_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.admin_onboarding_service.DTO.SignatureDTO;
import tn.esprit.admin_onboarding_service.controller.OnboardingController;
import tn.esprit.admin_onboarding_service.entity.Appointment;
import tn.esprit.admin_onboarding_service.entity.Collaborateur;
import tn.esprit.admin_onboarding_service.service.CalendarService;
import tn.esprit.admin_onboarding_service.service.OnboardingService;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminOnboardingServiceApplicationTests {

    @Mock private OnboardingService onboardingService;
    @Mock private CalendarService calendarService;

    @InjectMocks
    private OnboardingController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private Collaborateur collaborateur;

    private static final String VALID_BASE64 =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    // ✅ Helpers pour construire le JSON de SignatureDTO sans instancier la classe
    private String buildSignatureJson(Long id, String signature) {
        if (signature == null) {
            return String.format("{\"id\":%d,\"signature\":null}", id);
        }
        return String.format("{\"id\":%d,\"signature\":\"%s\"}", id, signature);
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        collaborateur = new Collaborateur();
        collaborateur.setId(1L);
        collaborateur.setNom("Ben Ali");
        collaborateur.setPrenom("Ahmed");
    }

    // ─────────────────────────────────────────────
    // POST /api/onboarding/transformer/{id}
    // ─────────────────────────────────────────────

    @Test
    void transformerCandidat_shouldReturn200OnSuccess() throws Exception {
        doNothing().when(onboardingService)
                .transformerCandidatEnCollaborateur(1L, "Développeur", "Ben Ali", "Ahmed");

        mockMvc.perform(post("/api/onboarding/transformer/1")
                        .param("metier", "Développeur")
                        .param("nom", "Ben Ali")
                        .param("prenom", "Ahmed"))
                .andExpect(status().isOk())
                .andExpect(content().string("Candidat transformé avec succès en collaborateur !"));

        verify(onboardingService)
                .transformerCandidatEnCollaborateur(1L, "Développeur", "Ben Ali", "Ahmed");
    }

    // ─────────────────────────────────────────────
    // GET /api/onboarding/all
    // ─────────────────────────────────────────────

    @Test
    void getAll_shouldReturnListOfCollaborateurs() throws Exception {
        when(onboardingService.recupererTousLesCollaborateurs())
                .thenReturn(List.of(collaborateur));

        mockMvc.perform(get("/api/onboarding/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nom").value("Ben Ali"))
                .andExpect(jsonPath("$[0].prenom").value("Ahmed"));

        verify(onboardingService).recupererTousLesCollaborateurs();
    }

    @Test
    void getAll_shouldReturnEmptyList() throws Exception {
        when(onboardingService.recupererTousLesCollaborateurs()).thenReturn(List.of());

        mockMvc.perform(get("/api/onboarding/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ─────────────────────────────────────────────
    // PUT /api/onboarding/finaliser/{id}
    // ─────────────────────────────────────────────

    @Test
    void finaliserOnboarding_shouldReturn200() throws Exception {
        doNothing().when(onboardingService).finaliserOnboarding(1L);

        mockMvc.perform(put("/api/onboarding/finaliser/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Processus d'onboarding finalisé."));

        verify(onboardingService).finaliserOnboarding(1L);
    }

    // ─────────────────────────────────────────────
    // GET /api/onboarding/calendar/{year}/{month}
    // ─────────────────────────────────────────────

    @Test
    void getCalendar_shouldReturnAppointments() throws Exception {
        Appointment appointment = new Appointment();
        appointment.setTitle("Réunion onboarding");

        LocalDate firstDay = LocalDate.of(2025, 6, 1);
        when(calendarService.getAppointmentsByMonth(firstDay))
                .thenReturn(List.of(appointment));

        mockMvc.perform(get("/api/onboarding/calendar/2025/6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Réunion onboarding"));

        verify(calendarService).getAppointmentsByMonth(firstDay);
    }

    @Test
    void getCalendar_shouldReturnEmptyListWhenNoAppointments() throws Exception {
        when(calendarService.getAppointmentsByMonth(any(LocalDate.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/onboarding/calendar/2025/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ─────────────────────────────────────────────
    // GET /api/onboarding/stats
    // ─────────────────────────────────────────────

    @Test
    void getDashboardStats_shouldReturnStatsMap() throws Exception {
        Map<String, Object> stats = Map.of(
                "total", 10,
                "finalises", 7,
                "enCours", 3
        );
        when(onboardingService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/onboarding/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(10))
                .andExpect(jsonPath("$.finalises").value(7))
                .andExpect(jsonPath("$.enCours").value(3));

        verify(onboardingService).getDashboardStats();
    }

    // ─────────────────────────────────────────────
    // POST /api/onboarding/signature
    // ✅ Utilisation de buildSignatureJson() au lieu de new SignatureDTO()
    // ─────────────────────────────────────────────

    @Test
    void saveSignature_shouldReturn200WhenValid() throws Exception {
        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.createDirectories(any(Path.class))).thenReturn(null);
            filesMock.when(() -> Files.write(any(Path.class), any(byte[].class))).thenReturn(null);

            mockMvc.perform(post("/api/onboarding/signature")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(buildSignatureJson(1L, VALID_BASE64)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Signature enregistrée avec succès"));
        }
    }

    @Test
    void saveSignature_shouldReturn400WhenSignatureIsBlank() throws Exception {
        mockMvc.perform(post("/api/onboarding/signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(buildSignatureJson(1L, "  ")))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Signature manquante"));
    }

    @Test
    void saveSignature_shouldReturn400WhenSignatureIsNull() throws Exception {
        mockMvc.perform(post("/api/onboarding/signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(buildSignatureJson(1L, null)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Signature manquante"));
    }

    @Test
    void saveSignature_shouldReturn400WhenBase64Invalid() throws Exception {
        mockMvc.perform(post("/api/onboarding/signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(buildSignatureJson(1L, "!!!invalid-base64!!!")))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Format de signature invalide"));
    }

    @Test
    void saveSignature_shouldAcceptBase64WithDataPrefix() throws Exception {
        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.createDirectories(any(Path.class))).thenReturn(null);
            filesMock.when(() -> Files.write(any(Path.class), any(byte[].class))).thenReturn(null);

            mockMvc.perform(post("/api/onboarding/signature")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(buildSignatureJson(1L, "data:image/png;base64," + VALID_BASE64)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Signature enregistrée avec succès"));
        }
    }

    // ─────────────────────────────────────────────
    // GET /api/onboarding/signature/{id}
    // ─────────────────────────────────────────────

    @Test
    void getSignature_shouldReturn200WithBase64() throws Exception {
        byte[] fakeImage = Base64.getDecoder().decode(VALID_BASE64);

        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.exists(any(Path.class))).thenReturn(true);
            filesMock.when(() -> Files.readAllBytes(any(Path.class))).thenReturn(fakeImage);

            mockMvc.perform(get("/api/onboarding/signature/1"))
                    .andExpect(status().isOk())
                    .andExpect(content().string(
                            org.hamcrest.Matchers.startsWith("data:image/png;base64,")
                    ));
        }
    }

    @Test
    void getSignature_shouldReturn404WhenFileNotFound() throws Exception {
        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.exists(any(Path.class))).thenReturn(false);

            mockMvc.perform(get("/api/onboarding/signature/99"))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Signature non trouvée"));
        }
    }

    // ─────────────────────────────────────────────
    // POST /api/onboarding/uploadQR
    // ─────────────────────────────────────────────

    @Test
    void uploadQRCode_shouldReturn200WhenValid() throws Exception {
        Map<String, String> body = Map.of("imageData", VALID_BASE64);

        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.createDirectories(any(Path.class))).thenReturn(null);
            filesMock.when(() -> Files.write(any(Path.class), any(byte[].class))).thenReturn(null);

            mockMvc.perform(post("/api/onboarding/uploadQR")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("QR Code enregistré avec succès"))
                    .andExpect(jsonPath("$.filePath").exists());
        }
    }

    @Test
    void uploadQRCode_shouldReturn400WhenImageDataMissing() throws Exception {
        Map<String, String> body = Map.of();

        mockMvc.perform(post("/api/onboarding/uploadQR")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("QR Code manquant"));
    }

    @Test
    void uploadQRCode_shouldReturn400WhenBase64Invalid() throws Exception {
        Map<String, String> body = Map.of("imageData", "!!!invalid!!!");

        mockMvc.perform(post("/api/onboarding/uploadQR")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Format QR Code invalide"));
    }

    @Test
    void uploadQRCode_shouldAcceptBase64WithDataPrefix() throws Exception {
        Map<String, String> body = Map.of("imageData", "data:image/png;base64," + VALID_BASE64);

        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.createDirectories(any(Path.class))).thenReturn(null);
            filesMock.when(() -> Files.write(any(Path.class), any(byte[].class))).thenReturn(null);

            mockMvc.perform(post("/api/onboarding/uploadQR")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("QR Code enregistré avec succès"));
        }
    }
}