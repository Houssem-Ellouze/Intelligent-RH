package tn.esprit.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("talent-management", r -> r
                        .path("/auth/**", "/rec/calendars/**", "/rec/appointments/**", "/files/**", "/calendars/**", "/api/candidats/**")
                        .uri("lb://TALENT-MANAGEMENT-SERVICE"))

                .route("Admin_Onboarding_Service", r -> r
                        .path("/api/onboarding/**")
                        .uri("lb://ADMIN-CONTRACT-ONBOARDING-SERVICE"))

                .route("Recruitment", r -> r
                        .path("/api/recrutement/**")
                        .uri("lb://RECRUTEMENT-SERVICE"))


                .route("Scoutisme<", r -> r
                        .path("/api/scouting/**")
                        .uri("lb://SCOUTISME-SERVICE"))

                .route("Board", r -> r
                        .path("/api/boards/**")
                        .uri("lb://KANBAN-BACKEND"))

                .route("Board", r -> r
                        .path("/api/columns/**")
                        .uri("lb://KANBAN-BACKEND"))

                .route("Board", r -> r
                        .path("/api/tasks/**")
                        .uri("lb://KANBAN-BACKEND"))

                .build();
    }
}


