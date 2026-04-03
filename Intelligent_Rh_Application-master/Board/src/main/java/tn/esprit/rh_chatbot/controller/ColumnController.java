package tn.esprit.rh_chatbot.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.rh_chatbot.dto.ColumnDTO;
import tn.esprit.rh_chatbot.service.ColumnService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    // GET /api/boards/{boardId}/columns
    @GetMapping("/boards/{boardId}/columns")
    public ResponseEntity<List<ColumnDTO.Response>> getColumnsByBoard(@PathVariable Long boardId) {
        return ResponseEntity.ok(columnService.getColumnsByBoard(boardId));
    }

    // POST /api/boards/{boardId}/columns
    @PostMapping("/boards/{boardId}/columns")
    public ResponseEntity<ColumnDTO.Response> createColumn(
            @PathVariable Long boardId,
            @Valid @RequestBody ColumnDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(columnService.createColumn(boardId, request));
    }

    // PUT /api/columns/{columnId}
    @PutMapping("/columns/{columnId}")
    public ResponseEntity<ColumnDTO.Response> updateColumn(
            @PathVariable Long columnId,
            @Valid @RequestBody ColumnDTO.Request request) {
        return ResponseEntity.ok(columnService.updateColumn(columnId, request));
    }

    // DELETE /api/columns/{columnId}
    @DeleteMapping("/columns/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long columnId) {
        columnService.deleteColumn(columnId);
        return ResponseEntity.noContent().build();
    }
}