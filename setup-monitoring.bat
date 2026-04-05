@echo off
setlocal enabledelayedexpansion

:: Couleurs (Simulées avec des titres)
echo ========================================
echo   INSTALLATION MONITORING STACK
echo   Prometheus + Grafana + Docker
echo ========================================
echo.

:: Étape 0: Vérifier le dossier
if not exist "Intelligent_Rh_Application-master" (
echo [X] ERREUR: Ce script doit etre execute dans le dossier contenant 'Intelligent_Rh_Application-master'
pause
exit /b 1
)

echo [OK] Dossier projet trouve.

:: Étape 1: Création de la structure de dossiers Grafana
echo.
echo [!] Creation de la structure de dossiers Grafana...

if not exist "grafana\provisioning\datasources" (
mkdir "grafana\provisioning\datasources"
echo    [OK] Cree: grafana\provisioning\datasources
) else (
echo    [-] Deja existant: grafana\provisioning\datasources
)

if not exist "grafana\provisioning\dashboards" (
mkdir "grafana\provisioning\dashboards"
echo    [OK] Cree: grafana\provisioning\dashboards
)

:: Étape 2: Création du fichier prometheus-docker.yml
echo.
echo [!] Creation du fichier prometheus-docker.yml...

(
echo global:
echo   scrape_interval: 15s
echo   evaluation_interval: 15s
echo   scrape_timeout: 10s
echo   external_labels:
echo     cluster: 'intelligent-rh-docker'
echo     environment: 'production'
echo.
echo scrape_configs:
echo   - job_name: 'eureka-discovery'
echo     metrics_path: '/actuator/prometheus'
echo     static_configs:
echo       - targets: ['discovery:8761']
echo         labels:
echo           application: 'discovery'
echo   - job_name: 'config-server'
echo     metrics_path: '/actuator/prometheus'
echo     static_configs:
echo       - targets: ['config-server:8888']
echo   - job_name: 'gateway'
echo     metrics_path: '/actuator/prometheus'
echo     static_configs:
echo       - targets: ['gateway:8222']
echo   - job_name: 'talent-management'
echo     metrics_path: '/actuator/prometheus'
echo     static_configs:
echo       - targets: ['talent-management-service:9002']
echo   - job_name: 'recruitment'
echo     metrics_path: '/actuator/prometheus'
echo     static_configs:
echo       - targets: ['recrutement-service:8082']
echo   - job_name: 'scoutisme'
echo     metrics_path: '/actuator/prometheus'
echo     static_configs:
echo       - targets: ['scoutisme-service:9009']
echo   - job_name: 'kanban-board'
echo     metrics_path: '/actuator/prometheus'
echo     static_configs:
echo       - targets: ['kanban-backend:8088']
echo   - job_name: 'admin-onboarding'
echo     metrics_path: '/actuator/prometheus'
echo     static_configs:
echo       - targets: ['admin-contract-onboarding-service:8083']
echo   - job_name: 'prometheus'
echo     static_configs:
echo       - targets: ['localhost:9090']
) > prometheus-docker.yml

echo    [OK] Fichier cree: prometheus-docker.yml

:: Étape 3: Création du fichier datasource.yml
echo.
echo [!] Creation du fichier datasource.yml pour Grafana...

(
echo apiVersion: 1
echo datasources:
echo   - name: Prometheus
echo     type: prometheus
echo     access: proxy
echo     url: http://prometheus:9090
echo     isDefault: true
echo     editable: true
echo     jsonData:
echo       timeInterval: "15s"
echo     version: 1
) > grafana\provisioning\datasources\datasource.yml

echo    [OK] Fichier cree: grafana\provisioning\datasources\datasource.yml

:: Étape 4: Réseau Docker
echo.
echo [!] Verification du reseau Docker...
docker network inspect microservices-network >nul 2>&1
if %errorlevel% neq 0 (
echo    📡 Creation du reseau 'microservices-network'...
docker network create microservices-network
echo    [OK] Reseau cree
) else (
echo    [OK] Reseau deja existant
)

:: Fin
echo.
echo ========================================
echo   [OK] INSTALLATION TERMINEE !
echo ========================================
echo Acceder a Prometheus: http://localhost:9090
echo Acceder a Grafana:    http://localhost:3000
echo ========================================
pause