package tn.esprit.employees;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.employees.auth.*;
import tn.esprit.employees.entity.Speciality;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationTest {

    @Mock
    private AuthenticationService service;

    @InjectMocks
    private AuthenticationController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    // ─────────────────────────────────────────────
    // POST /auth/register
    // ─────────────────────────────────────────────

    @Test
    void register_shouldReturn200WhenSuccess() throws Exception { // Changement de nom pour la clarté
        doNothing().when(service).register(any(RegistrationRequest.class));

        String requestJson = """
        {
            "nom": "Ahmed",
            "prenom": "Ben Ali",
            "email": "ahmed@test.com",
            "password": "Password123!",
            "telephone": "22333444",
            "speciality": "RH"
        }
        """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk()); // On attend 200 au lieu de 202

        verify(service).register(any(RegistrationRequest.class));
    }
    // ─────────────────────────────────────────────
    // POST /auth/authenticate
    // ─────────────────────────────────────────────

    @Test
    void authenticate_shouldReturn200WithToken() throws Exception {
        AuthenticationResponse response = AuthenticationResponse.builder()
                .accessToken("access-token-123")
                .refreshToken("refresh-token-456")
                .build();

        when(service.authenticate(any(AuthenticationRequest.class))).thenReturn(response);

        String requestJson = """
                {
                    "email": "ahmed@test.com",
                    "password": "Password123!"
                }
                """;

        mockMvc.perform(post("/auth/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                // Correction : Utilisation de snake_case (access_token)
                .andExpect(jsonPath("$.access_token").value("access-token-123"))
                .andExpect(jsonPath("$.refresh_token").value("refresh-token-456"));
    }

    // ─────────────────────────────────────────────
    // GET /auth/activate
    // ─────────────────────────────────────────────

    @Test
    void activateAccount_shouldReturn200WhenTokenValid() throws Exception {
        doNothing().when(service).activateAccount("valid-token-123");

        mockMvc.perform(get("/auth/activate")
                        .param("token", "valid-token-123"))
                .andExpect(status().isOk())
                .andExpect(content().string("Account activated successfully!"));
    }

    // ─────────────────────────────────────────────
    // POST /auth/refresh-token
    // ─────────────────────────────────────────────

    @Test
    void refreshToken_shouldCallServiceAndReturn200() throws Exception {
        doNothing().when(service).refreshToken(any(), any());

        mockMvc.perform(post("/auth/refresh-token"))
                .andExpect(status().isOk());

        verify(service).refreshToken(any(), any());
    }

    // ─────────────────────────────────────────────
    // POST /auth/reset-password
    // ─────────────────────────────────────────────

    @Test
    void resetPassword_shouldReturn200WhenTokenValid() throws Exception {
        doNothing().when(service).resetPassword("valid-token", "NewPass123!");

        mockMvc.perform(post("/auth/reset-password")
                        .param("token", "valid-token")
                        .param("newPassword", "NewPass123!"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Mot de passe réinitialisé avec succès"));
    }

    @Test
    void resetPassword_shouldReturn400WhenTokenInvalid() throws Exception {
        // Simulation d'une erreur via ResponseStatusException
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token invalide"))
                .when(service).resetPassword(eq("bad-token"), anyString());

        mockMvc.perform(post("/auth/reset-password")
                        .param("token", "bad-token")
                        .param("newPassword", "NewPass123!"))
                .andExpect(status().isBadRequest());
    }

    // ─────────────────────────────────────────────
    // POST /auth/logout
    // ─────────────────────────────────────────────

    @Test
    void logout_shouldReturn200AndCallService() throws Exception {
        // Correction : Utilisation de any() partout pour éviter le PotentialStubbingProblem
        doNothing().when(service).logout(any(), any(), any());

        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk());

        verify(service, times(1)).logout(any(), any(), any());
    }
}