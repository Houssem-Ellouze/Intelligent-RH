package tn.esprit.rh_chatbot.service;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.rh_chatbot.dto.ColumnDTO;
import tn.esprit.rh_chatbot.dto.TaskDTO;
import tn.esprit.rh_chatbot.entity.Board;
import tn.esprit.rh_chatbot.entity.Column;
import tn.esprit.rh_chatbot.repository.BoardRepository;
import tn.esprit.rh_chatbot.repository.ColumnRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final BoardRepository boardRepository;

    // ---- GET COLUMNS BY BOARD ----
    @Transactional(readOnly = true)
    public List<ColumnDTO.Response> getColumnsByBoard(Long boardId) {
        return columnRepository.findByBoardIdOrderByPositionAsc(boardId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---- CREATE COLUMN ----
    public ColumnDTO.Response createColumn(Long boardId, ColumnDTO.Request request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("Board introuvable: " + boardId));

        Column column = Column.builder()
                .name(request.getName())
                .position(request.getPosition())
                .color(request.getColor() != null ? request.getColor() : "#FFFFFF")
                .board(board)
                .build();

        return toResponse(columnRepository.save(column));
    }

    // ---- UPDATE COLUMN ----
    public ColumnDTO.Response updateColumn(Long columnId, ColumnDTO.Request request) {
        Column column = columnRepository.findById(columnId)
                .orElseThrow(() -> new EntityNotFoundException("Colonne introuvable: " + columnId));

        column.setName(request.getName());
        if (request.getColor() != null) column.setColor(request.getColor());
        column.setPosition(request.getPosition());

        return toResponse(columnRepository.save(column));
    }

    // ---- DELETE COLUMN ----
    public void deleteColumn(Long columnId) {
        if (!columnRepository.existsById(columnId)) {
            throw new EntityNotFoundException("Colonne introuvable: " + columnId);
        }
        columnRepository.deleteById(columnId);
    }

    // ---- MAPPER ----
    public ColumnDTO.Response toResponse(Column col) {
        return ColumnDTO.Response.builder()
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
                .build();
    }
}