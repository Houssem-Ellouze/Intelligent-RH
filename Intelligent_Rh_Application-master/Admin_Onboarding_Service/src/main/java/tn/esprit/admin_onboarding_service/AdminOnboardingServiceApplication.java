package tn.esprit.admin_onboarding_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
public class AdminOnboardingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run ( AdminOnboardingServiceApplication.class, args );
    }

}
