@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   Deployment Prometheus + Grafana - Intelligent RH
echo ============================================================
echo.

set NAMESPACE=intelligent-rh
set K8S_DIR=k8s

REM Verification connexion Kubernetes
kubectl cluster-info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Impossible de se connecter au cluster Kubernetes.
    echo Verifiez que kubectl est configure correctement.
    pause
    exit /b 1
)

echo [INFO] Connexion au cluster Kubernetes OK.
echo.

REM ============================================================
REM ETAPE 1 : Namespace
REM ============================================================
echo [STEP 1/6] Verification du namespace...
kubectl get namespace %NAMESPACE% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Namespace %NAMESPACE% n'existe pas, creation...
    kubectl apply -f %K8S_DIR%\namespace.yaml
) else (
    echo [OK] Namespace %NAMESPACE% existe deja.
)
echo.

REM ============================================================
REM ETAPE 2 : Persistent Volume Claims
REM ============================================================
echo [STEP 2/6] Creation des PVC pour Prometheus et Grafana...
kubectl apply -f %K8S_DIR%\monitoring-pvc.yaml -n %NAMESPACE%
if %ERRORLEVEL% EQU 0 (
    echo [OK] PVC crees avec succes.
) else (
    echo [WARN] Erreur lors de la creation des PVC (peut-etre deja existants).
)
echo.

REM Attente que les PVC soient bound
echo [INFO] Attente que les PVC soient lies... (10s)
timeout /t 10 /nobreak >nul
kubectl get pvc -n %NAMESPACE% | findstr "prometheus grafana"
echo.

REM ============================================================
REM ETAPE 3 : Deploiement Prometheus
REM ============================================================
echo [STEP 3/6] Deploiement de Prometheus...

echo   - Application de la configuration (ConfigMap)...
kubectl apply -f %K8S_DIR%\prometheus-configmap.yaml -n %NAMESPACE%

echo   - Deploiement de Prometheus avec RBAC...
kubectl apply -f %K8S_DIR%\prometheus-deployment.yaml -n %NAMESPACE%

if %ERRORLEVEL% EQU 0 (
    echo [OK] Prometheus deploye avec succes.
) else (
    echo [ERROR] Echec du deploiement de Prometheus.
    pause
    exit /b 1
)
echo.

REM ============================================================
REM ETAPE 4 : Deploiement Grafana
REM ============================================================
echo [STEP 4/6] Deploiement de Grafana...

echo   - Application des ConfigMaps (Datasources + Dashboards)...
kubectl apply -f %K8S_DIR%\grafana-configmap.yaml -n %NAMESPACE%

echo   - Deploiement de Grafana...
kubectl apply -f %K8S_DIR%\grafana-deployment.yaml -n %NAMESPACE%

if %ERRORLEVEL% EQU 0 (
    echo [OK] Grafana deploye avec succes.
) else (
    echo [ERROR] Echec du deploiement de Grafana.
    pause
    exit /b 1
)
echo.

REM ============================================================
REM ETAPE 5 : Attente du demarrage
REM ============================================================
echo [STEP 5/6] Attente du demarrage des pods... (60s)
timeout /t 60 /nobreak >nul
echo.

REM ============================================================
REM ETAPE 6 : Verification
REM ============================================================
echo [STEP 6/6] Verification de l'etat des pods...
echo.
echo --- Pods Prometheus ---
kubectl get pods -n %NAMESPACE% -l app=prometheus
echo.
echo --- Pods Grafana ---
kubectl get pods -n %NAMESPACE% -l app=grafana
echo.
echo --- Services ---
kubectl get svc -n %NAMESPACE% | findstr "prometheus grafana"
echo.

REM ============================================================
REM Informations d'acces
REM ============================================================
echo ============================================================
echo   DEPLOIEMENT TERMINE !
echo ============================================================
echo.
echo URLs d'acces :
echo.
echo   Prometheus : http://localhost:30090
echo                - Interface de requetes et visualisation des targets
echo.
echo   Grafana    : http://localhost:30030
echo                - Username : admin
echo                - Password : admin123
echo.
echo ============================================================
echo   PROCHAINES ETAPES
echo ============================================================
echo.
echo 1. Ouvrir Prometheus :
echo    - Verifier que les targets sont UP dans Status ^> Targets
echo.
echo 2. Ouvrir Grafana :
echo    - Se connecter avec admin/admin123
echo    - Verifier la datasource Prometheus dans Configuration
echo    - Ouvrir le dashboard "Intelligent RH - Spring Boot Metrics"
echo.
echo 3. Si les microservices ne sont pas encore deployes :
echo    - Deployer d'abord vos microservices Spring Boot
echo    - S'assurer qu'ils exposent /actuator/prometheus
echo.
echo 4. Consulter le guide complet :
echo    - Lire PROMETHEUS_GRAFANA_GUIDE.md
echo.
echo ============================================================

REM Test de connectivite (optionnel)
echo.
echo [INFO] Test de connectivite aux services...
echo.

REM Test Prometheus
echo Testing Prometheus...
curl -s http://localhost:30090/-/healthy >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Prometheus est accessible et healthy
) else (
    echo [WARN] Prometheus n'est pas encore accessible
    echo       Attendez quelques secondes et verifiez manuellement
)

REM Test Grafana
echo Testing Grafana...
curl -s http://localhost:30030/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Grafana est accessible et healthy
) else (
    echo [WARN] Grafana n'est pas encore accessible
    echo       Attendez quelques secondes et verifiez manuellement
)

echo.
echo ============================================================
echo Appuyez sur une touche pour quitter...
pause >nul
exit /b 0
