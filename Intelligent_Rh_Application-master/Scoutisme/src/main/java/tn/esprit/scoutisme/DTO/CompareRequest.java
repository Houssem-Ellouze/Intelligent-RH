package tn.esprit.scoutisme.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompareRequest {
    private Long talentAId;
    private Long talentBId;
}
