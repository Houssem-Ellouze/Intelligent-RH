package tn.esprit.employees.auth;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.employees.entity.Candidat;


@Service
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;

    public void saveUserToken(Candidat candidat, String jwtToken) {
        Token token = Token.builder()
                .candidat(candidat)
                .token(jwtToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }
}
