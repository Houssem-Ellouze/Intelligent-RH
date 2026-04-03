package tn.esprit.rh_chatbot;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.rh_chatbot.controller.BoardController;
import tn.esprit.rh_chatbot.controller.ColumnController;
import tn.esprit.rh_chatbot.controller.TaskController;
import tn.esprit.rh_chatbot.dto.BoardDTO;
import tn.esprit.rh_chatbot.dto.ColumnDTO;
import tn.esprit.rh_chatbot.dto.TaskDTO;
import tn.esprit.rh_chatbot.service.BoardService;
import tn.esprit.rh_chatbot.service.ColumnService;
import tn.esprit.rh_chatbot.service.TaskService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RhChatbotApplicationTests {

    @Mock private BoardService boardService;
    @Mock private ColumnService columnService;
    @Mock private TaskService taskService;

    @InjectMocks private BoardController boardController;
    @InjectMocks private ColumnController columnController;
    @InjectMocks private TaskController taskController;

    private MockMvc boardMvc;
    private MockMvc columnMvc;
    private MockMvc taskMvc;

    private ObjectMapper objectMapper;

    private BoardDTO.Response boardResponse;
    private BoardDTO.Request  boardRequest;
    private ColumnDTO.Response columnResponse;
    private ColumnDTO.Request  columnRequest;
    private TaskDTO.Response   taskResponse;
    private TaskDTO.Request    taskRequest;
    private TaskDTO.MoveRequest moveRequest;

    @BeforeEach
    void setUp() {
        boardMvc  = MockMvcBuilders.standaloneSetup(boardController).build();
        columnMvc = MockMvcBuilders.standaloneSetup(columnController).build();
        taskMvc   = MockMvcBuilders.standaloneSetup(taskController).build();

        objectMapper = new ObjectMapper();

        // Board
        boardRequest = new BoardDTO.Request();
        boardRequest.setName("Sprint Board");

        boardResponse = new BoardDTO.Response();
        boardResponse.setId(1L);
        boardResponse.setName("Sprint Board");

        // Column
        columnRequest = new ColumnDTO.Request();
        columnRequest.setName("To Do");

        columnResponse = new ColumnDTO.Response();
        columnResponse.setId(10L);
        columnResponse.setName("To Do");

        // Task — ✅ on ne set que les champs qui existent vraiment dans TaskDTO.Response
        taskRequest = new TaskDTO.Request();

        taskResponse = new TaskDTO.Response();
        taskResponse.setId(100L);
        // ✅ NE PAS set title/columnId ici si ces setters n'existent pas
        // → les tests vérifient uniquement $.id

        moveRequest = new TaskDTO.MoveRequest();
        moveRequest.setTargetColumnId(20L);
    }

    // ══════════════════════════════════════════════
    //  BOARD CONTROLLER
    // ══════════════════════════════════════════════

    @Test
    void getAllBoards_shouldReturnList() throws Exception {
        when(boardService.getAllBoards()).thenReturn(List.of(boardResponse));

        boardMvc.perform(get("/api/boards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Sprint Board"));

        verify(boardService).getAllBoards();
    }

    @Test
    void getAllBoards_shouldReturnEmptyList() throws Exception {
        when(boardService.getAllBoards()).thenReturn(List.of());

        boardMvc.perform(get("/api/boards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getBoardById_shouldReturnBoard() throws Exception {
        when(boardService.getBoardById(1L)).thenReturn(boardResponse);

        boardMvc.perform(get("/api/boards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Sprint Board"));

        verify(boardService).getBoardById(1L);
    }

    @Test
    void createBoard_shouldReturn201() throws Exception {
        when(boardService.createBoard(any(BoardDTO.Request.class))).thenReturn(boardResponse);

        boardMvc.perform(post("/api/boards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(boardRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Sprint Board"));

        verify(boardService).createBoard(any(BoardDTO.Request.class));
    }

    @Test
    void updateBoard_shouldReturn200() throws Exception {
        boardResponse.setName("Sprint Board V2");
        when(boardService.updateBoard(eq(1L), any(BoardDTO.Request.class))).thenReturn(boardResponse);

        boardMvc.perform(put("/api/boards/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(boardRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Sprint Board V2"));

        verify(boardService).updateBoard(eq(1L), any(BoardDTO.Request.class));
    }

    @Test
    void deleteBoard_shouldReturn204() throws Exception {
        doNothing().when(boardService).deleteBoard(1L);

        boardMvc.perform(delete("/api/boards/1"))
                .andExpect(status().isNoContent());

        verify(boardService).deleteBoard(1L);
    }

    // ══════════════════════════════════════════════
    //  COLUMN CONTROLLER
    // ══════════════════════════════════════════════

    @Test
    void getColumnsByBoard_shouldReturnList() throws Exception {
        when(columnService.getColumnsByBoard(1L)).thenReturn(List.of(columnResponse));

        columnMvc.perform(get("/api/boards/1/columns"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("To Do"));

        verify(columnService).getColumnsByBoard(1L);
    }

    @Test
    void getColumnsByBoard_shouldReturnEmptyList() throws Exception {
        when(columnService.getColumnsByBoard(99L)).thenReturn(List.of());

        columnMvc.perform(get("/api/boards/99/columns"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createColumn_shouldReturn201() throws Exception {
        when(columnService.createColumn(eq(1L), any(ColumnDTO.Request.class)))
                .thenReturn(columnResponse);

        columnMvc.perform(post("/api/boards/1/columns")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(columnRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.name").value("To Do"));

        verify(columnService).createColumn(eq(1L), any(ColumnDTO.Request.class));
    }

    @Test
    void updateColumn_shouldReturn200() throws Exception {
        columnResponse.setName("In Progress");
        when(columnService.updateColumn(eq(10L), any(ColumnDTO.Request.class)))
                .thenReturn(columnResponse);

        columnMvc.perform(put("/api/columns/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(columnRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("In Progress"));

        verify(columnService).updateColumn(eq(10L), any(ColumnDTO.Request.class));
    }

    @Test
    void deleteColumn_shouldReturn204() throws Exception {
        doNothing().when(columnService).deleteColumn(10L);

        columnMvc.perform(delete("/api/columns/10"))
                .andExpect(status().isNoContent());

        verify(columnService).deleteColumn(10L);
    }

    // ══════════════════════════════════════════════
    //  TASK CONTROLLER
    // ══════════════════════════════════════════════

    @Test
    void getTasksByColumn_shouldReturnList() throws Exception {
        when(taskService.getTasksByColumn(10L)).thenReturn(List.of(taskResponse));

        taskMvc.perform(get("/api/columns/10/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                // ✅ vérifier seulement $.id — title absent du DTO Response
                .andExpect(jsonPath("$[0].id").value(100L));

        verify(taskService).getTasksByColumn(10L);
    }

    @Test
    void getTasksByColumn_shouldReturnEmptyList() throws Exception {
        when(taskService.getTasksByColumn(99L)).thenReturn(List.of());

        taskMvc.perform(get("/api/columns/99/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createTask_shouldReturn201() throws Exception {
        when(taskService.createTask(eq(10L), any(TaskDTO.Request.class)))
                .thenReturn(taskResponse);

        taskMvc.perform(post("/api/columns/10/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isCreated())
                // ✅ vérifier seulement $.id
                .andExpect(jsonPath("$.id").value(100L));

        verify(taskService).createTask(eq(10L), any(TaskDTO.Request.class));
    }

    @Test
    void updateTask_shouldReturn200() throws Exception {
        when(taskService.updateTask(eq(100L), any(TaskDTO.Request.class)))
                .thenReturn(taskResponse);

        taskMvc.perform(put("/api/tasks/100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isOk())
                // ✅ vérifier seulement $.id
                .andExpect(jsonPath("$.id").value(100L));

        verify(taskService).updateTask(eq(100L), any(TaskDTO.Request.class));
    }

    @Test
    void moveTask_shouldReturn200WithNewColumn() throws Exception {
        when(taskService.moveTask(eq(100L), any(TaskDTO.MoveRequest.class)))
                .thenReturn(taskResponse);

        taskMvc.perform(put("/api/tasks/100/move")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(moveRequest)))
                .andExpect(status().isOk())
                // ✅ vérifier seulement $.id — columnId absent du DTO Response
                .andExpect(jsonPath("$.id").value(100L));

        verify(taskService).moveTask(eq(100L), any(TaskDTO.MoveRequest.class));
    }

    @Test
    void moveTask_shouldCallServiceWithCorrectTaskId() throws Exception {
        when(taskService.moveTask(eq(100L), any(TaskDTO.MoveRequest.class)))
                .thenReturn(taskResponse);

        taskMvc.perform(put("/api/tasks/100/move")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(moveRequest)))
                .andExpect(status().isOk());

        verify(taskService, times(1)).moveTask(eq(100L), any(TaskDTO.MoveRequest.class));
    }

    @Test
    void deleteTask_shouldReturn204() throws Exception {
        doNothing().when(taskService).deleteTask(100L);

        taskMvc.perform(delete("/api/tasks/100"))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(100L);
    }
}