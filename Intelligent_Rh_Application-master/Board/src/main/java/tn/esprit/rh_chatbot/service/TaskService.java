package tn.esprit.rh_chatbot.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.rh_chatbot.dto.TaskDTO;
import tn.esprit.rh_chatbot.entity.Column;
import tn.esprit.rh_chatbot.entity.Task;
import tn.esprit.rh_chatbot.repository.ColumnRepository;
import tn.esprit.rh_chatbot.repository.TaskRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;

    // ---- GET TASKS BY COLUMN ----
    @Transactional(readOnly = true)
    public List<TaskDTO.Response> getTasksByColumn(Long columnId) {
        return taskRepository.findByColumnIdOrderByPositionAsc(columnId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---- CREATE TASK ----
    public TaskDTO.Response createTask(Long columnId, TaskDTO.Request request) {
        Column column = columnRepository.findById(columnId)
                .orElseThrow(() -> new EntityNotFoundException("Colonne introuvable: " + columnId));

        Task task = Task.builder()
                .text(request.getText() != null ? request.getText() : "")
                .position(request.getPosition())
                .column(column)
                .build();

        return toResponse(taskRepository.save(task));
    }

    // ---- UPDATE TASK ----
    public TaskDTO.Response updateTask(Long taskId, TaskDTO.Request request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Tâche introuvable: " + taskId));

        task.setText(request.getText());
        task.setPosition(request.getPosition());

        return toResponse(taskRepository.save(task));
    }

    // ---- MOVE TASK (drag & drop entre colonnes) ----
    public TaskDTO.Response moveTask(Long taskId, TaskDTO.MoveRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Tâche introuvable: " + taskId));

        Column targetColumn = columnRepository.findById(request.getTargetColumnId())
                .orElseThrow(() -> new EntityNotFoundException("Colonne cible introuvable: " + request.getTargetColumnId()));

        task.setColumn(targetColumn);
        task.setPosition(request.getNewPosition());

        return toResponse(taskRepository.save(task));
    }

    // ---- DELETE TASK ----
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Tâche introuvable: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    // ---- MAPPER ----
    private TaskDTO.Response toResponse(Task task) {
        return TaskDTO.Response.builder()
                .id(task.getId())
                .text(task.getText())
                .position(task.getPosition())
                .createdAt(task.getCreatedAt())
                .build();
    }
}