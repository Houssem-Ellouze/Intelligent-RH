package tn.esprit.employees.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.employees.config.JwtService;
import tn.esprit.employees.entity.Candidat;
import tn.esprit.employees.entity.Speciality;
import tn.esprit.employees.repository.CandidatRepository;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final PasswordEncoder passwordEncoder;
    private final CandidatRepository userRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenService tokenService;

    @Value("${application.security.mailing.frontend.activation-url}")
    private String activationUrl;

    @Transactional
    public void register(RegistrationRequest request) throws MessagingException {

        System.out.println("=== Registration Request Received ===");
        System.out.println("Request object: " + request);

        // === Conversion String → Enum avec meilleure gestion d'erreur ===
        if (request.getSpeciality() == null || request.getSpeciality().trim().isEmpty()) {
            throw new IllegalArgumentException("La spécialité est obligatoire");
        }

        Speciality specialityEnum;
        try {
            specialityEnum = Speciality.valueOf(request.getSpeciality().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Spécialité invalide : '" + request.getSpeciality()
                            + "'. Valeurs acceptées : " + Arrays.toString(Speciality.values())
            );
        }

        // Construction de l'entité
        Candidat candidat = Candidat.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .password(passwordEncoder.encode(request.getPassword()))
                .speciality(specialityEnum)
                .enabled(false)
                .build();

        Candidat savedUser = userRepository.save(candidat);

        String activationToken = generateAndSaveActivationToken(savedUser);
        sendValidationEmail(savedUser, activationToken);

        System.out.println("✅ User registered successfully with ID: " + savedUser.getId());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // Récupérer le token de réinitialisation
        Token savedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Token invalide"
                ));

        // Vérifier si le token a expiré
        if (savedToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Token expiré"
            );
        }

        // Récupérer l'utilisateur associé
        Candidat candidat = savedToken.getCandidat();
        candidat.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(candidat);

        // Marquer le token comme utilisé
        savedToken.setValidatedAt(LocalDateTime.now());
        savedToken.setExpired(true);
        tokenRepository.save(savedToken);
    }

    // ------------------ SEND EMAIL ------------------
    private void sendValidationEmail(Candidat candidat, String token) throws MessagingException {

        String activationLink = activationUrl + "/activate-account?token=" + token;

        emailService.sendEmailUsingTemplate(
                candidat.getEmail(),          // to
                candidat.getNom(),            // username
                token,                        // code d'activation
                activationLink,               // lien d'activation
                "activate_account",           // template (sans .html)
                "Activation de votre compte"  // subject
        );
    }


    // ------------------ GENERATE & SAVE ACTIVATION TOKEN ------------------
    private String generateAndSaveActivationToken(Candidat candidat) {
        String generatedToken = generateNumericCode(6);

        Token token = Token.builder()
                .token(generatedToken)
                .candidat(candidat)
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusMinutes(15))
                .expired(false)
                .revoked(false)
                .build();

        tokenRepository.save(token);
        return generatedToken;
    }
    // ------------------ REQUEST PASSWORD RESET ------------------
    // ------------------ REQUEST PASSWORD RESET ------------------
    @Transactional
    public void requestPasswordReset(String email) throws MessagingException {

        // 1. Vérifier si l'utilisateur existe
        Candidat candidat = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Générer un code numérique à 6 chiffres
        String resetToken = generateNumericCode(6);

        // 3. Créer et sauvegarder le token
        Token token = Token.builder()
                .token(resetToken)
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusMinutes(15))
                .expired(false)
                .revoked(false)
                .candidat(candidat)
                .build();

        tokenRepository.save(token);

        // 4. Construire l’URL du frontend Angular
        String resetUrl = activationUrl + "/reset-password?token=" + resetToken;

        // 5. Envoyer email AVEC VARIABLES
        emailService.sendEmailUsingTemplate(
                candidat.getEmail(),
                candidat.getNom(),           // username
                resetToken,                  // code
                resetUrl,                    // lien
                "reset_password",            // nom template
                "Réinitialisation de votre mot de passe"
        );

        System.out.println("Reset token generated for " + email + ": " + resetToken);
    }




    private String generateNumericCode(int length) {
        String characters = "0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            code.append(characters.charAt(random.nextInt(characters.length())));
        }
        return code.toString();
    }

    // ------------------ ACTIVATE ACCOUNT ------------------
    @Transactional
    public void activateAccount(String token) {

        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        String email = jwtService.extractUsername(token);

        String type = jwtService.extractClaim(token, claims -> claims.get("type", String.class));

        if (!"activation".equals(type)) {
            throw new RuntimeException("Invalid activation token");
        }

        Candidat candidat = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (candidat.isEnabled()) {
            return;
        }

        candidat.setEnabled(true);
        userRepository.save(candidat);
    }


    // ------------------ AUTHENTICATE ------------------
    public AuthenticationResponse authenticate(@Valid AuthenticationRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Candidat candidat = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("fullName", candidat.getNomComplet());

        String jwtToken = jwtService.generateToken(claims, candidat);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }

    // ------------------ REFRESH TOKEN ------------------
    @Transactional
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String refreshToken = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        Candidat candidat = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!jwtService.isTokenValid(refreshToken )) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String accessToken = jwtService.generateToken(candidat);
        revokeAllUserTokens(candidat);
        tokenService.saveUserToken(candidat, accessToken);

        AuthenticationResponse authResponse = AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        response.setContentType("application/json");
        new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
    }

    private void revokeAllUserTokens(Candidat candidat) {
        var validTokens = tokenRepository.findAllValidTokenByUser(candidat.getId());
        if (!validTokens.isEmpty()) {
            validTokens.forEach(t -> {
                t.setExpired(true);
                t.setRevoked(true);
            });
            tokenRepository.saveAll(validTokens);
        }
    }

    // ------------------ LOGOUT ------------------
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return;

        String jwt = authHeader.substring(7);
        if (jwt.isBlank()) return;

        tokenRepository.findByToken(jwt).ifPresent(t -> {
            t.setExpired(true);
            t.setRevoked(true);
            tokenRepository.save(t);
        });

        SecurityContextHolder.clearContext();
    }

}
