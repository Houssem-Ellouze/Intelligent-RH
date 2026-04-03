package tn.esprit.rh_chatbot.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.rh_chatbot.dto.BoardDTO;
import tn.esprit.rh_chatbot.dto.ColumnDTO;
import tn.esprit.rh_chatbot.dto.TaskDTO;
import tn.esprit.rh_chatbot.entity.Board;
import tn.esprit.rh_chatbot.entity.Column;
import tn.esprit.rh_chatbot.repository.BoardRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;

    // ---- GET ALL ----
    @Transactional(readOnly = true)
    public List<BoardDTO.Response> getAllBoards() {
        return boardRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---- GET BY ID ----
    @Transactional(readOnly = true)
    public BoardDTO.Response getBoardById(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Board introuvable avec l'id: " + id));
        return toResponse(board);
    }

    // ---- CREATE ----
    public BoardDTO.Response createBoard(BoardDTO.Request request) {
        Board board = Board.builder()
                .name(request.getName())
                .build();

        // Colonnes par défaut (comme dans ton Angular)
        List<String[]> defaultColumns = List.of(
                new String[]{"Ideas",    "#FFB3B3"},
                new String[]{"Research", "#FFE0B3"},
                new String[]{"ToDo",     "#D4FFB3"},
                new String[]{"Done",     "#B3E5FF"}
        );

        for (int i = 0; i < defaultColumns.size(); i++) {
            Column col = Column.builder()
                    .name(defaultColumns.get(i)[0])
                    .color(defaultColumns.get(i)[1])
                    .position(i)
                    .board(board)
                    .build();
            board.getColumns().add(col);
        }

        return toResponse(boardRepository.save(board));
    }

    // ---- UPDATE NAME ----
    public BoardDTO.Response updateBoard(Long id, BoardDTO.Request request) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Board introuvable avec l'id: " + id));
        board.setName(request.getName());
        return toResponse(boardRepository.save(board));
    }

    // ---- DELETE ----
    public void deleteBoard(Long id) {
        if (!boardRepository.existsById(id)) {
            throw new EntityNotFoundException("Board introuvable avec l'id: " + id);
        }
        boardRepository.deleteById(id);
    }

    // ---- MAPPER ----
    public BoardDTO.Response toResponse(Board board) {
        List<ColumnDTO.Response> columnResponses = board.getColumns().stream()
                .map(col -> ColumnDTO.Response.builder()
                        .id(col.getId())
                        .name(col.getName())
                        .position(col.getPosition())
                        .color(col.getColor())
                        .tasks(col.getTasks().stream()
                                .map(task -> TaskDTO.Response.builder()
                                        .id(task.getId())
                                        .text(task.getText())
                                        .position(task.getPosition())
                                        .createdAt(task.getCreatedAt())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return BoardDTO.Response.builder()
                .id(board.getId())
                .name(board.getName())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .columns(columnResponses)
                .build();
    }
}