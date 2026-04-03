package tn.esprit.rh_chatbot.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;

    private int position;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id")
    @JsonBackReference // Empêche de remonter vers la colonne
    private Column column;

    public Task() {}

    public Task(Long id, String text, int position, LocalDateTime createdAt, Column column) {
        this.id = id;
        this.text = text;
        this.position = position;
        this.createdAt = createdAt;
        this.column = column;
    }

    public static TaskBuilder builder() { return new TaskBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Column getColumn() { return column; }
    public void setColumn(Column column) { this.column = column; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static class TaskBuilder {
        private Long id;
        private String text;
        private int position;
        private LocalDateTime createdAt;
        private Column column;

        public TaskBuilder id(Long id) { this.id = id; return this; }
        public TaskBuilder text(String text) { this.text = text; return this; }
        public TaskBuilder position(int position) { this.position = position; return this; }
        public TaskBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TaskBuilder column(Column column) { this.column = column; return this; }

        public Task build() {
            Task t = new Task();
            t.id = this.id;
            t.text = this.text;
            t.position = this.position;
            t.createdAt = this.createdAt;
            t.column = this.column;
            return t;
        }
    }
}