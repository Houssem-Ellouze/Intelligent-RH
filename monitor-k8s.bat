@echo off
setlocal enabledelayedexpansion

:: --- CONFIGURATION ---
set NAMESPACE=intelligent-rh

:MENU
cls
echo.
echo ============================================
echo    INTELLIGENT RH - KUBERNETES MONITOR
echo ============================================
echo  Namespace actuel : %NAMESPACE%
echo.
echo [1] Statut de tous les Pods (Wide)
echo [2] Liste des Services ^& Ingress
echo [3] Voir les Logs (100 dernieres lignes)
echo [4] Voir les Erreurs (Events)
echo [5] Consommation CPU/RAM (Metrics)
echo [6] Check Sante des services critiques
echo [7] Port-Forward (Acces local rapide)
echo [8] Redemarrer un Deployment
echo [9] Scaler un Deployment (Replicas)
echo [0] Quitter
echo.
set /p choice="Selectionnez une option : "

if "%choice%"=="1" goto PODS
if "%choice%"=="2" goto SERVICES
if "%choice%"=="3" goto LOGS
if "%choice%"=="4" goto EVENTS
if "%choice%"=="5" goto RESOURCES
if "%choice%"=="6" goto HEALTH
if "%choice%"=="7" goto PORTFORWARD
if "%choice%"=="8" goto RESTART
if "%choice%"=="9" goto SCALE
if "%choice%"=="0" exit /b 0
goto MENU

:PODS
cls
echo.
echo ========== STATUT DES PODS ==========
kubectl get pods -n %NAMESPACE% -o wide
echo.
pause
goto MENU

:SERVICES
cls
echo.
echo ========== SERVICES ^& INGRESS ==========
kubectl get services -n %NAMESPACE%
echo.
echo --- ROUTES EXTERNES (INGRESS) ---
kubectl get ingress -n %NAMESPACE%
echo.
pause
goto MENU

:LOGS
cls
echo.
echo Liste des pods disponibles :
kubectl get pods -n %NAMESPACE% --no-headers -o custom-columns=":metadata.name"
echo.
set /p podname="Entrez le nom du pod : "
echo.
:: Ajout de --all-containers pour eviter les erreurs si le pod a un sidecar
kubectl logs %podname% -n %NAMESPACE% --tail=100 --all-containers
echo.
pause
goto MENU

:EVENTS
cls
echo.
echo ========== EVENEMENTS (ERREURS UNIQUEMENT) ==========
:: On filtre pour ne voir que ce qui n'est pas "Normal"
kubectl get events -n %NAMESPACE% --sort-by='.lastTimestamp' | findstr /V "Normal"
echo.
pause
goto MENU

:RESOURCES
cls
echo.
echo ========== CONSOMMATION DES RESSOURCES ==========
echo [Nodes]
kubectl top nodes
echo.
echo [Pods dans %NAMESPACE%]
kubectl top pods -n %NAMESPACE%
echo.
pause
goto MENU

:HEALTH
cls
echo.
echo ========== HEALTH CHECK DES SERVICES CLES ==========
:: Correction des noms pour correspondre a vos deploiements reels
set CRITICAL_SERVICES=mysql-db discovery gateway frontend kanban-backend recruitment-service
for %%s in (%CRITICAL_SERVICES%) do (
    echo | set /p="Verification de %%s... "
    kubectl get deployment %%s -n %NAMESPACE% >nul 2>&1
    if errorlevel 1 (
        echo [INTROUVABLE]
    ) else (
        :: On verifie si au moins 1 replica est "Available"
        kubectl get deployment %%s -n %NAMESPACE% -o jsonpath="{.status.availableReplicas}" | findstr "[1-9]" >nul
        if errorlevel 1 (
            echo [HS - 0 REPLICA PRET]
        ) else (
            echo [OK - EN LIGNE]
        )
    )
)
echo.
pause
goto MENU

:PORTFORWARD
cls
echo.
echo Services disponibles :
kubectl get svc -n %NAMESPACE% --no-headers -o custom-columns=":metadata.name,:spec.ports[0].port"
echo.
set /p svcname="Nom du service : "
set /p localport="Port local (ex: 8088) : "
set /p remoteport="Port distant (appuyez sur Entree si identique) : "

if "%remoteport%"=="" set remoteport=%localport%

echo.
echo [ACTIF] localhost:%localport% -^> %svcname%:%remoteport%
echo Appuyez sur Ctrl+C pour arreter le tunnel...
kubectl port-forward svc/%svcname% %localport%:%remoteport% -n %NAMESPACE%
goto MENU

:RESTART
cls
echo.
kubectl get deployments -n %NAMESPACE% --no-headers -o custom-columns=":metadata.name"
echo.
set /p deployment="Nom du deployment a redemarrer : "
kubectl rollout restart deployment/%deployment% -n %NAMESPACE%
kubectl rollout status deployment/%deployment% -n %NAMESPACE%
pause
goto MENU

:SCALE
cls
echo.
kubectl get deployments -n %NAMESPACE% --no-headers -o custom-columns=":metadata.name,:spec.replicas"
echo.
set /p deployment="Nom du deployment : "
set /p replicas="Nombre de replicas souhaites : "
kubectl scale deployment/%deployment% --replicas=%replicas% -n %NAMESPACE%
pause
goto MENU