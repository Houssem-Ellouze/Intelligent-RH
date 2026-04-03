package tn.esprit.employees.entity;

import lombok.Getter;
@Getter
public enum Permission {
    // Permissions Client
    CLIENT_READ,
    CLIENT_CREATE,
    CLIENT_UPDATE,
    CLIENT_DELETE,

    // Permissions RH
    RH_READ,
    RH_CREATE,
    RH_UPDATE,
    RH_DELETE,

    // Permissions Manager
    MANAGER_READ,
    MANAGER_CREATE,
    MANAGER_UPDATE,
    MANAGER_DELETE,

    // Permissions Super Admin
    SUPER_ADMIN_READ,
    SUPER_ADMIN_CREATE,
    SUPER_ADMIN_UPDATE,
    SUPER_ADMIN_DELETE;
}
