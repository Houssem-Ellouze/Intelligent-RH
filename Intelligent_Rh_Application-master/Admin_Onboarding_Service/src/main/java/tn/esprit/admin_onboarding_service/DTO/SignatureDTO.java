package tn.esprit.admin_onboarding_service.DTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SignatureDTO {
    private Long id;
    private String signature;

}