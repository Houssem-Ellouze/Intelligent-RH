@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   DEPLOIEMENT MONITORING KUBERNETES
echo   Structure detectee : k8s\monitoring\
echo ========================================

set NAMESPACE=intelligent-rh
set MONITORING_DIR=k8s\monitoring
set SERVICES_DIR=k8s\services

:: 1. Vérification du dossier monitoring
if not exist "%MONITORING_DIR%" (
    echo [X] ERREUR: Le dossier %MONITORING_DIR% est introuvable.
    echo Verifiez l'emplacement du script.
    pause
    exit /b 1
)

echo [OK] Dossier de monitoring trouve.

:: 2. Application du stockage (PVC)
echo.
echo [STEP 1] Deploiement du stockage...
kubectl apply -f %MONITORING_DIR%\monitoring-pvc.yaml -n %NAMESPACE%
kubectl apply -f k8s\prometheus-pvc.yaml -n %NAMESPACE% 2>nul

:: 3. Application des ConfigMaps
echo.
echo [STEP 2] Configuration de Prometheus et Grafana...
kubectl apply -f %MONITORING_DIR%\prometheus-configmap.yaml -n %NAMESPACE%
kubectl apply -f %MONITORING_DIR%\grafana-configmap.yaml -n %NAMESPACE%

:: 4. Déploiement des applications
echo.
echo [STEP 3] Lancement des Pods Monitoring...
kubectl apply -f %MONITORING_DIR%\prometheus-deployment.yaml -n %NAMESPACE%
kubectl apply -f %MONITORING_DIR%\grafana-deployment.yaml -n %NAMESPACE%

:: 5. Nettoyage Docker (pour libérer les ports 9090 et 3000 sur Windows)
echo.
echo [STEP 4] Nettoyage des anciens conteneurs Docker...
docker stop prometheus grafana 2>nul
docker rm prometheus grafana 2>nul

echo.
echo ========================================
echo   STABILISATION (20 secondes)...
echo ========================================
timeout /t 20

echo.
echo [INFO] Etat des services de monitoring :
kubectl get pods -n %NAMESPACE% | findstr "prometheus grafana"
kubectl get svc -n %NAMESPACE% | findstr "prometheus grafana"

echo.
echo ========================================
echo   ACCES AUX INTERFACES
echo ========================================
echo Prometheus : http://localhost:30090
echo Grafana    : http://localhost:3000 (ou via port-forward)
echo.
echo Pour le port-forward manuel si besoin :
echo kubectl port-forward svc/prometheus 9090:9090 -n %NAMESPACE%
echo ========================================
pause