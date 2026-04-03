package tn.esprit.rh_chatbot.dto;


import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
public class TaskDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private String text;
        private int position;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MoveRequest {
        private Long targetColumnId;
        private int newPosition;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String text;
        private int position;
        private LocalDateTime createdAt;
    }
}