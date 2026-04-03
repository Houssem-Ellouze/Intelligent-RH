package tn.esprit.rh_chatbot.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "columns")
public class Column {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private int position;

    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    @JsonBackReference // Empêche de remonter vers le board lors de la sérialisation de la colonne
    private Board board;

    @OneToMany(mappedBy = "column", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("position ASC")
    private List<Task> tasks = new ArrayList<>();

    public Column() {}

    public static ColumnBuilder builder() { return new ColumnBuilder(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Board getBoard() { return board; }
    public void setBoard(Board board) { this.board = board; }

    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }

    public static class ColumnBuilder {
        private Long id;
        private String name;
        private int position;
        private String color;
        private Board board;
        private List<Task> tasks = new ArrayList<>();

        public ColumnBuilder id(Long id) { this.id = id; return this; }
        public ColumnBuilder name(String name) { this.name = name; return this; }
        public ColumnBuilder position(int position) { this.position = position; return this; }
        public ColumnBuilder color(String color) { this.color = color; return this; }
        public ColumnBuilder board(Board board) { this.board = board; return this; }
        public ColumnBuilder tasks(List<Task> tasks) { this.tasks = tasks; return this; }

        public Column build() {
            Column c = new Column();
            c.id = this.id;
            c.name = this.name;
            c.position = this.position;
            c.color = this.color;
            c.board = this.board;
            c.tasks = this.tasks;
            return c;
        }
    }
}