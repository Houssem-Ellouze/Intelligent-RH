package tn.esprit.employees;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.employees.controller.CandidatController;
import tn.esprit.employees.entity.Candidat;
import tn.esprit.employees.entity.DomainePrincipale;
import tn.esprit.employees.repository.CandidatRepository;
import tn.esprit.employees.service.CandidatService;
import tn.esprit.employees.service.FileService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// ✅ UNIQUEMENT cette annotation — pas de @SpringBootTest
@ExtendWith(MockitoExtension.class)
class EmployeesApplicationTests {

    @Mock
    private CandidatService service;

    @Mock
    private FileService fileService;

    @Mock
    private CandidatRepository repository;

    @InjectMocks
    private CandidatController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Candidat candidat;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        candidat = new Candidat();
        candidat.setId(1L);
        candidat.setNom("Ben Ali");
        candidat.setPrenom("Ahmed");
        candidat.setDomainePrincipale(DomainePrincipale.DEVELOPPEMENT_WEB);
    }

    @Test
    void getById_shouldReturnCandidatWhenExists() throws Exception {
        when(service.getById(1L)).thenReturn(candidat);

        mockMvc.perform(get("/api/candidats/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nom").value("Ben Ali"))
                .andExpect(jsonPath("$.prenom").value("Ahmed"));

        verify(service, times(1)).getById(1L);
    }

    @Test
    void getAll_shouldReturnListOfCandidats() throws Exception {
        Candidat c2 = new Candidat();
        c2.setId(2L);
        c2.setNom("Trabelsi");
        c2.setPrenom("Sana");

        when(service.getAll()).thenReturn(List.of(candidat, c2));

        mockMvc.perform(get("/api/candidats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nom").value("Ben Ali"))
                .andExpect(jsonPath("$[1].nom").value("Trabelsi"));

        verify(service).getAll();
    }

    @Test
    void getByFullIdentity_shouldReturnCandidatWhenFound() throws Exception {
        when(service.findByPrenomAndNom("Ahmed", "Ben Ali"))
                .thenReturn(Optional.of(candidat));

        mockMvc.perform(get("/api/candidats/search")
                        .param("prenom", "Ahmed")
                        .param("nom", "Ben Ali"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Ben Ali"));

        verify(service).findByPrenomAndNom("Ahmed", "Ben Ali");
    }

    @Test
    void getByFullIdentity_shouldReturn404WhenNotFound() throws Exception {
        when(service.findByPrenomAndNom("Inconnu", "Inconnu"))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/candidats/search")
                        .param("prenom", "Inconnu")
                        .param("nom", "Inconnu"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getByDate_shouldReturnCandidatsByDate() throws Exception {
        when(service.findByDate(LocalDate.of(2024, 1, 15)))
                .thenReturn(List.of(candidat));

        mockMvc.perform(get("/api/candidats/by-date")
                        .param("date", "2024-01-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(service).findByDate(LocalDate.of(2024, 1, 15));
    }

    @Test
    void create_shouldReturnCreatedCandidatWithoutFiles() throws Exception {
        String candidatJson = objectMapper.writeValueAsString(candidat);

        MockMultipartFile candidatPart = new MockMultipartFile(
                "candidat", "", "application/json", candidatJson.getBytes()
        );

        when(service.create(any(Candidat.class))).thenReturn(candidat);

        mockMvc.perform(multipart("/api/candidats/create")
                        .file(candidatPart))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("Ben Ali"));

        verify(service).create(any(Candidat.class));
        verify(fileService, never()).save(any());
    }

    @Test
    void create_shouldSaveImageAndCvWhenProvided() throws Exception {
        String candidatJson = objectMapper.writeValueAsString(candidat);

        MockMultipartFile candidatPart = new MockMultipartFile(
                "candidat", "", "application/json", candidatJson.getBytes()
        );
        MockMultipartFile imagePart = new MockMultipartFile(
                "image", "photo.jpg", "image/jpeg", "fake-image".getBytes()
        );
        MockMultipartFile cvPart = new MockMultipartFile(
                "cv", "cv.pdf", "application/pdf", "fake-cv".getBytes()
        );

        when(fileService.save(imagePart)).thenReturn("photo.jpg");
        when(fileService.save(cvPart)).thenReturn("cv.pdf");
        when(service.create(any(Candidat.class))).thenReturn(candidat);

        mockMvc.perform(multipart("/api/candidats/create")
                        .file(candidatPart)
                        .file(imagePart)
                        .file(cvPart))
                .andExpect(status().isCreated());

        verify(fileService, times(2)).save(any());
    }

    @Test
    void delete_shouldReturn204WhenDeleted() throws Exception {
        doNothing().when(service).deleteById(1L);

        mockMvc.perform(delete("/api/candidats/1"))
                .andExpect(status().isNoContent());

        verify(service).deleteById(1L);
    }


    @Test
    void checkCandidatExists_shouldReturnTrueWhenExists() throws Exception {
        when(repository.existsById(1L)).thenReturn(true);

        mockMvc.perform(get("/api/candidats/check/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void checkCandidatExists_shouldReturnFalseWhenNotExists() throws Exception {
        when(repository.existsById(99L)).thenReturn(false);

        mockMvc.perform(get("/api/candidats/check/99"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void getDashboardStats_shouldReturnStatsMap() throws Exception {
        Map<String, Object> stats = Map.of(
                "total", 42,
                "nouveaux", 5
        );
        when(service.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/candidats/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(42))
                .andExpect(jsonPath("$.nouveaux").value(5));

        verify(service).getDashboardStats();
    }
}