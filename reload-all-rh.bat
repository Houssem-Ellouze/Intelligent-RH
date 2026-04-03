@echo off
setlocal enabledelayedexpansion

:: --- CONFIGURATION ---
set NAMESPACE=intelligent-rh
set DELAY_DB=10
set DELAY_INFRA=20

echo ==========================================================
echo    RECHARGEMENT COMPLET DE L'ECOSYSTEME TALENTFLOW
echo ==========================================================

:: 1. BASES DE DONNEES
echo [1/5] Relancement des Bases de Donnees (MySQL ^& SonarDB)...
kubectl rollout restart deployment mysql-db -n %NAMESPACE%
kubectl rollout restart deployment sonardb -n %NAMESPACE%
timeout /t %DELAY_DB% /nobreak > nul

:: 2. INFRASTRUCTURE SPRING CLOUD (Critique pour la Gateway)
echo [2/5] Mise a jour de Discovery et Config Server...
kubectl rollout restart deployment discovery -n %NAMESPACE%
kubectl rollout restart deployment config-server -n %NAMESPACE%
echo [INFO] Attente de la stabilisation du Discovery (Eureka)...
timeout /t %DELAY_INFRA% /nobreak > nul

:: 3. OUTILS TIERS
echo [3/5] Redemarrage de SonarQube et MailDev...
kubectl rollout restart deployment sonarqube -n %NAMESPACE%
kubectl rollout restart deployment maildev -n %NAMESPACE%

:: 4. MICROSERVICES BACKEND
:: Note : "kanban-backend" est le nom correct identifie precedemment via kubectl get pods
echo [4/5] Deploiement des microservices via la Gateway...
set SERVICES=gateway talent-management-service recrutement-service scoutisme-service kanban-backend admin-contract-onboarding-service job-prediction

for %%s in (%SERVICES%) do (
    echo   -^> Redemarrage en cours : %%s...
    kubectl rollout restart deployment %%s -n %NAMESPACE%
)

:: 5. FRONTEND ET RESEAU
echo [5/5] Mise a jour du Frontend Angular et de l'Ingress...
kubectl rollout restart deployment frontend -n %NAMESPACE%
:: On force le rafraichissement de l'Ingress pour appliquer les regles CORS/Paths
kubectl apply -f k8s/ingress.yaml -n %NAMESPACE%

:: --- VERIFICATION FINALE ---
echo.
echo ==========================================================
echo Verification du statut des ressources...
echo ==========================================================
kubectl get pods -n %NAMESPACE%
echo.
echo [INFO] L'Ingress est actif sur : http://intelligent-rh:32000/login
echo [INFO] Swagger Kanban dispo sur : http://intelligent-rh:32000/swagger-ui/index.html
echo.
echo TERMINE ! Patientez 60s pour la synchronisation Eureka.
pause