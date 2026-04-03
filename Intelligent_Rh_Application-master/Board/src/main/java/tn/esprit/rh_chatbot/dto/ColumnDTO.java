package tn.esprit.rh_chatbot.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class ColumnDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotBlank(message = "Le nom de la colonne est obligatoire")
        private String name;
        private int position;
        private String color;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String name;
        private int position;
        private String color;
        private List<TaskDTO.Response> tasks;
    }
}