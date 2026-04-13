@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   Deployment Monitoring (Full) - Intelligent RH
echo ============================================================
echo.

set "NAMESPACE=intelligent-rh"
set "K8S_DIR=k8s"
set "MONITORING_DIR=k8s\monitoring"

:: Vérification de la connexion
kubectl cluster-info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Impossible de se connecter au cluster Kubernetes.
    pause
    exit /b 1
)

echo [STEP 1/6] Preparation du namespace...
kubectl apply -f "%K8S_DIR%\namespace.yaml"

echo [STEP 2/6] Application des PVC...
:: Correction ici : on utilise des guillemets pour éviter l'erreur de chemin
kubectl apply -f "%MONITORING_DIR%\monitoring-pvc.yaml" -n %NAMESPACE%
kubectl apply -f "%K8S_DIR%\prometheus-pvc.yaml" -n %NAMESPACE%
kubectl apply -f "%K8S_DIR%\sonarqube-pvc.yaml" -n %NAMESPACE%

echo [STEP 3/6] Deploiement de Prometheus...
kubectl apply -f "%MONITORING_DIR%\prometheus-configmap.yaml" -n %NAMESPACE%
kubectl apply -f "%MONITORING_DIR%\prometheus-deployment.yaml" -n %NAMESPACE%

echo [STEP 4/6] Deploiement de Grafana...
kubectl apply -f "%MONITORING_DIR%\grafana-configmap.yaml" -n %NAMESPACE%
kubectl apply -f "%MONITORING_DIR%\grafana-deployment.yaml" -n %NAMESPACE%

echo [STEP 5/6] Deploiement de SonarQube...
kubectl apply -f "%K8S_DIR%\sonarqube.yaml" -n %NAMESPACE%
kubectl apply -f "%K8S_DIR%\sonarqube-deployment.yaml" -n %NAMESPACE%

echo [STEP 6/6] Configuration Ingress...
kubectl apply -f "%K8S_DIR%\ingress.yaml" -n %NAMESPACE%

echo [INFO] Activation du Port-Forward Kanban (8088)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8088') do taskkill /f /pid %%a 2>nul
start /b kubectl port-forward svc/kanban-backend 8088:8088 -n %NAMESPACE% > nul 2>&1

echo.
echo ============================================================
echo   ACCES VIA : http://intelligent-rh/
echo ============================================================
echo Prometheus : /prometheus
echo Grafana    : /grafana
echo SonarQube  : /sonarqube
echo ============================================================

pause
exit /b 0