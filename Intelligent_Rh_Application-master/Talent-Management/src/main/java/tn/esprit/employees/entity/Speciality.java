package tn.esprit.employees.entity;

import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import static tn.esprit.employees.entity.Permission.*;

@Getter
public enum Speciality {
    CLIENT(
            Set.of(CLIENT_READ, CLIENT_CREATE, CLIENT_UPDATE, CLIENT_DELETE)
    ),
    SUPER_ADMIN(
            Set.of(
                    SUPER_ADMIN_READ, SUPER_ADMIN_CREATE, SUPER_ADMIN_UPDATE, SUPER_ADMIN_DELETE,
                    CLIENT_READ, CLIENT_CREATE, CLIENT_UPDATE, CLIENT_DELETE,
                    RH_READ, RH_CREATE, RH_UPDATE, RH_DELETE,
                    MANAGER_READ, MANAGER_CREATE, MANAGER_UPDATE, MANAGER_DELETE
            )
    ),
    RH(
            Set.of(RH_READ, RH_CREATE, RH_UPDATE, RH_DELETE)
    ),
    MANAGER(
            Set.of(MANAGER_READ, MANAGER_CREATE, MANAGER_UPDATE, MANAGER_DELETE)
    );

    private final Set<Permission> permissions;

    Speciality(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public List<SimpleGrantedAuthority> getAuthorities() {
        var authorities = permissions.stream()
                .map(permission -> new SimpleGrantedAuthority(permission.name()))
                .collect(Collectors.toList());

        // Ajouter le rôle lui-même (ex: ROLE_CLIENT)
        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));

        return authorities;
    }
}
