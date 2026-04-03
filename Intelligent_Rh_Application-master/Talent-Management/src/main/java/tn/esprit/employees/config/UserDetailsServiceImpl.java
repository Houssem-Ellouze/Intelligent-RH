package tn.esprit.employees.config;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tn.esprit.employees.entity.Candidat;
import tn.esprit.employees.repository.CandidatRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class UserDetailsServiceImpl implements UserDetailsService {

    private final CandidatRepository candidatRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Candidat candidat = candidatRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Candidat with email " + email + " not found")
                );

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(candidat.getEmail())
                .password(candidat.getPassword())
                .authorities(candidat.getSpeciality().getAuthorities())
                .accountLocked(false)
                .disabled(false)
                .build();
    }
}
