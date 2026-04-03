# Plateforme RH – PFE / Capgemini Engineering 2026

## 🎯 Contexte & Objectif
Dans le cadre de mon projet de fin d’études au sein de **Capgemini Engineering**, j’ai développé une **plateforme RH modulaire et évolutive**, basée sur une architecture **microservices**, pour moderniser la gestion des employés, compétences et processus de recrutement.

L’objectif principal est de fournir une solution sécurisée, scalable et maintenable, intégrant :  
- Gestion des employés  
- Suivi des compétences  
- Pilotage du recrutement  
- Potentiel intégration IA pour **matching candidat ↔ offre** et **chatbot RH**.

---

## 🧩 Architecture Microservices

### 1️⃣ API Gateway
- **Rôle** : Point d’entrée unique, routage vers les microservices, gestion de la sécurité (JWT/OAuth2), logging et monitoring.  
- **Dépendances Maven** :
  - `spring-cloud-starter-gateway`  
  - `spring-cloud-starter-netflix-eureka-client`  
  - `spring-boot-starter-security` (optionnel)  
  - `spring-boot-starter-actuator` (optionnel)  

### 2️⃣ Config Server
- **Rôle** : Centralisation et versioning de la configuration des microservices.  
- **Dépendances Maven** :
  - `spring-cloud-config-server`  
  - `spring-boot-starter-web`  
  - `spring-boot-starter-security` (optionnel)  
  - `spring-boot-starter-actuator` (optionnel)  
  - `spring-cloud-dependencies` (BOM)  

### 3️⃣ Discovery Server (Eureka)
- **Rôle** : Enregistrement et découverte automatique des microservices.  
- **Dépendances Maven** :
  - `spring-cloud-starter-netflix-eureka-server`  
  - `spring-boot-starter-web`  
  - `spring-boot-starter-security` (optionnel)  
  - `spring-boot-starter-actuator` (optionnel)  
  - `spring-cloud-dependencies` (BOM)  

### 4️⃣ Microservices Métier

| Microservice | Rôle | Base de données | Fonctionnalités principales |
|--------------|------|----------------|-----------------------------|
| **employees-service** | Gestion des employés | PostgreSQL / MySQL | CRUD employés, info personnelle et professionnelle, département, historique carrière |
| **competences-service** | Gestion des compétences | PostgreSQL / MySQL | CRUD compétences, mapping employé ↔ compétence, niveaux de maîtrise |
| **recrutement-service** | Gestion du recrutement | PostgreSQL / MySQL | Offres, candidats, candidatures, workflow recrutement |

> 🔹 Chaque microservice dispose de **sa propre base de données** pour garantir indépendance et scalabilité.

### 5️⃣ Microservices IA & Avancés (optionnels)
- **matching-service** : Scoring et matching automatique candidat ↔ offre.  
- **rh-chatbot-service (RAG)** : Chatbot intelligent pour support RH et candidats.  
- **reporting-service** : KPI RH et dashboards analytiques.  

---

## ⚙️ Stack Technique

### Backend
- Java 17+
- Spring Boot
- Spring Cloud (Config, Gateway, Eureka)
- JPA / Hibernate
- REST APIs

### Frontend
- Angular
- TypeScript
- RxJS
- Angular Material / PrimeNG

### Bases de données
- PostgreSQL (recommandé) ou MySQL  
- 1 base par microservice  

### Sécurité
- JWT / OAuth2
- RBAC (ADMIN, RH, RECRUTEUR)
- Chiffrement & conformité RGPD  

### DevOps & Conteneurs
- Docker / Docker Compose
- CI/CD (Jenkins / GitHub Actions)
- Git

---
