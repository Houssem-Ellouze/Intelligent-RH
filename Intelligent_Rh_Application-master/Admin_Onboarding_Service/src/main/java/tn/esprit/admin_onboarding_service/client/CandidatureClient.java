package tn.esprit.admin_onboarding_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.admin_onboarding_service.DTO.CandidatureDTO;


@FeignClient(name = "recrutement-service", url = "http://talent-management-service:9002")
public interface CandidatureClient {

    @GetMapping("/api/recrutement/candidatures/{id}")
    CandidatureDTO getCandidatureById(@PathVariable Long id);

}