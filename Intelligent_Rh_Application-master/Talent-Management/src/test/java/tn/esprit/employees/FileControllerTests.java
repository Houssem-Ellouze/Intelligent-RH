package tn.esprit.employees;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.employees.controller.FileController;
import tn.esprit.employees.service.FileService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
class FileControllerTests {

    @Mock
    private FileService fileService;

    @InjectMocks
    private FileController fileController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(fileController).build();
    }

    // ─────────────────────────────────────────────
    // POST /files/upload
    // ─────────────────────────────────────────────

    @Test
    void upload_shouldReturn200WhenFileUploaded() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "hello".getBytes()
        );

        when(fileService.save(any())).thenReturn("test.txt");

        mockMvc.perform(multipart("/files/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(content().string("File uploaded successfully"));

        verify(fileService, times(1)).save(any());
    }

    @Test
    void upload_shouldCallSaveExactlyOnce() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "pdf-content".getBytes()
        );

        mockMvc.perform(multipart("/files/upload").file(file))
                .andExpect(status().isOk());

        verify(fileService, times(1)).save(any());
    }

    // ─────────────────────────────────────────────
    // GET /files/get/{fileName}
    // ─────────────────────────────────────────────

    @Test
    void getFile_shouldReturnPdfContentType() throws Exception {
        Resource resource = new ByteArrayResource("fake-pdf".getBytes());
        when(fileService.getFile("rapport.pdf")).thenReturn(resource);

        mockMvc.perform(get("/files/get/rapport.pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));

        verify(fileService).getFile("rapport.pdf");
    }

    @Test
    void getFile_shouldReturnJpegContentType() throws Exception {
        Resource resource = new ByteArrayResource("fake-image".getBytes());
        when(fileService.getFile("photo.jpg")).thenReturn(resource);

        mockMvc.perform(get("/files/get/photo.jpg"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"));
    }

    @Test
    void getFile_shouldReturnJpegContentTypeForJpegExtension() throws Exception {
        Resource resource = new ByteArrayResource("fake-image".getBytes());
        when(fileService.getFile("photo.jpeg")).thenReturn(resource);

        mockMvc.perform(get("/files/get/photo.jpeg"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"));
    }

    @Test
    void getFile_shouldReturnPngContentType() throws Exception {
        Resource resource = new ByteArrayResource("fake-png".getBytes());
        when(fileService.getFile("logo.png")).thenReturn(resource);

        mockMvc.perform(get("/files/get/logo.png"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"));
    }

    @Test
    void getFile_shouldReturnOctetStreamForUnknownExtension() throws Exception {
        Resource resource = new ByteArrayResource("some-data".getBytes());
        when(fileService.getFile("archive.zip")).thenReturn(resource);

        mockMvc.perform(get("/files/get/archive.zip"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/octet-stream"));
    }

    @Test
    void getFile_shouldReturnOctetStreamForTxtFile() throws Exception {
        Resource resource = new ByteArrayResource("text".getBytes());
        when(fileService.getFile("notes.txt")).thenReturn(resource);

        mockMvc.perform(get("/files/get/notes.txt"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/octet-stream"));
    }
}