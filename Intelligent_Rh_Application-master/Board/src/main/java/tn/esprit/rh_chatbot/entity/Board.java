package tn.esprit.rh_chatbot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@Entity
@Table(name = "boards")
@AllArgsConstructor
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Builder.Default // Très important avec Lombok @Builder
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Column> columns = new ArrayList<>();

    public Board() {}

    public static BoardBuilder builder() { return new BoardBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Column> getColumns() { return columns; }
    public void setColumns(List<Column> columns) { this.columns = columns; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static class BoardBuilder {
        private Long id;
        private String name;
        private List<Column> columns = new ArrayList<>();

        public BoardBuilder id(Long id) { this.id = id; return this; }
        public BoardBuilder name(String name) { this.name = name; return this; }
        public BoardBuilder columns(List<Column> columns) { this.columns = columns; return this; }

        public Board build() {
            Board b = new Board();
            b.id = this.id;
            b.name = this.name;
            b.columns = this.columns;
            return b;
        }
    }
}