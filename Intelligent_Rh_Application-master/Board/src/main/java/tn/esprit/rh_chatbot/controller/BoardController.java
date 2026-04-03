package tn.esprit.rh_chatbot.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.rh_chatbot.dto.BoardDTO;
import tn.esprit.rh_chatbot.service.BoardService;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // GET /api/boards
    @GetMapping
    public ResponseEntity<List<BoardDTO.Response>> getAllBoards() {
        return ResponseEntity.ok(boardService.getAllBoards());
    }

    // GET /api/boards/{id}
    @GetMapping("/{id}")
    public ResponseEntity<BoardDTO.Response> getBoardById(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.getBoardById(id));
    }

    // POST /api/boards
    @PostMapping
    public ResponseEntity<BoardDTO.Response> createBoard(@Valid @RequestBody BoardDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(boardService.createBoard(request));
    }

    // PUT /api/boards/{id}
    @PutMapping("/{id}")
    public ResponseEntity<BoardDTO.Response> updateBoard(
            @PathVariable Long id,
            @Valid @RequestBody BoardDTO.Request request) {
        return ResponseEntity.ok(boardService.updateBoard(id, request));
    }

    // DELETE /api/boards/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}