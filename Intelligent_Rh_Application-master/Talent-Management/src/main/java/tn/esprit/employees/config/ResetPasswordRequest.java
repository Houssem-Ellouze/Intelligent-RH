package tn.esprit.employees.config;


public record ResetPasswordRequest(
        String token,
        String newPassword,
        String confirmationPassword
) {}