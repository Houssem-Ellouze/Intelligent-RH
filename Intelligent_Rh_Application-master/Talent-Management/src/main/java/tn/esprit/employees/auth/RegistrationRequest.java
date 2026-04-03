package tn.esprit.employees.auth;

import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.employees.entity.Speciality;
@Getter
@Setter
@Builder

public class RegistrationRequest {

    @NotBlank(message = "FirstName is mandatory")
    private String nom;

    @NotBlank(message = "LastName is mandatory")
    private String prenom;

    @Email(message = "Email is not formatted")
    @NotBlank(message = "Email is mandatory")
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 8 , message = "Password should be 8 characters long minimum")
    private String password;

    @NotBlank(message = "PhoneNumber is mandatory")
    @Size(min = 8 , message = "PhoneNumber should be 8 characters long minimum")
    private String telephone;

    @NotNull(message = "Speciality must not be null")
    private String speciality;     // ← CHANGÉ en String (plus simple)
}