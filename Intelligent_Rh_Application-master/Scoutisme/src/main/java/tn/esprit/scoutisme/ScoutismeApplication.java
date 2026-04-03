package tn.esprit.scoutisme;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableFeignClients
@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaRepositories("tn.esprit.scoutisme.repository")
public class ScoutismeApplication {

    public static void main(String[] args) {
        SpringApplication.run ( ScoutismeApplication.class, args );
    }

}
