package tn.esprit.rh_chatbot.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.rh_chatbot.dto.TaskDTO;
import tn.esprit.rh_chatbot.service.TaskService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // GET /api/columns/{columnId}/tasks
    @GetMapping("/columns/{columnId}/tasks")
    public ResponseEntity<List<TaskDTO.Response>> getTasksByColumn(@PathVariable Long columnId) {
        return ResponseEntity.ok(taskService.getTasksByColumn(columnId));
    }

    // POST /api/columns/{columnId}/tasks
    @PostMapping("/columns/{columnId}/tasks")
    public ResponseEntity<TaskDTO.Response> createTask(
            @PathVariable Long columnId,
            @RequestBody TaskDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(columnId, request));
    }

    // PUT /api/tasks/{taskId}
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskDTO.Response> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskDTO.Request request) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request));
    }

    // PUT /api/tasks/{taskId}/move  ← pour le drag & drop
    @PutMapping("/tasks/{taskId}/move")
    public ResponseEntity<TaskDTO.Response> moveTask(
            @PathVariable Long taskId,
            @RequestBody TaskDTO.MoveRequest request) {
        return ResponseEntity.ok(taskService.moveTask(taskId, request));
    }

    // DELETE /api/tasks/{taskId}
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}