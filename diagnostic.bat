@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   DIAGNOSTIC MONITORING STACK (K8S)
echo   Projet : Intelligent RH
echo ========================================
echo.

set NAMESPACE=intelligent-rh

:: Test 1: Vérifier les Pods actifs
echo [1/7] Verification des Pods dans le namespace %NAMESPACE%...
echo.
kubectl get pods -n %NAMESPACE%
echo.
echo ----------------------------------------
pause

:: Test 2: Vérifier les Services (DNS interne)
echo.
echo [2/7] Verification des Services et IPs...
echo.
kubectl get svc -n %NAMESPACE%
echo.
echo ----------------------------------------
pause

:: Test 3: Tester la résolution DNS depuis l'intérieur du Pod Prometheus
echo.
echo [3/7] Test de resolution DNS interne (CoreDNS)...
echo.
:: On recupere le nom exact du pod prometheus
for /f "tokens=1" %%i in ('kubectl get pods -n %NAMESPACE% -l app=prometheus --no-headers') do set PROM_POD=%%i

if "%PROM_POD%"=="" (
    echo [X] ERREUR: Pod Prometheus introuvable !
    goto end
)

echo Test DNS pour discovery...
kubectl exec %PROM_POD% -n %NAMESPACE% -- nslookup discovery >nul 2>&1
if %errorlevel% equ 0 (echo [OK] discovery resolvable) else (echo [X] discovery NOT resolvable)

echo Test DNS pour config-server...
kubectl exec %PROM_POD% -n %NAMESPACE% -- nslookup config-server >nul 2>&1
if %errorlevel% equ 0 (echo [OK] config-server resolvable) else (echo [X] config-server NOT resolvable)

echo Test DNS pour gateway...
kubectl exec %PROM_POD% -n %NAMESPACE% -- nslookup gateway >nul 2>&1
if %errorlevel% equ 0 (echo [OK] gateway resolvable) else (echo [X] gateway NOT resolvable)
echo.
echo ----------------------------------------
pause

:: Test 4: Vérifier les endpoints actuator via Port-Forward (Simulation)
echo.
echo [4/7] Verification de l'accessibilite des Metrics Actuator...
echo.
echo Note: Ce test suppose que vous avez expose les ports ou que vous testez depuis le cluster.
:: Test rapide via kubectl exec pour voir si le port repond
kubectl exec %PROM_POD% -n %NAMESPACE% -- wget -qO- http://discovery:8761/actuator/prometheus --timeout=2 >nul 2>&1
if %errorlevel% equ 0 (echo [OK] Metrics Discovery accessibles) else (echo [X] Metrics Discovery INACCESSIBLES)

kubectl exec %PROM_POD% -n %NAMESPACE% -- wget -qO- http://config-server:8888/actuator/prometheus --timeout=2 >nul 2>&1
if %errorlevel% equ 0 (echo [OK] Metrics Config-Server accessibles) else (echo [X] Metrics Config-Server INACCESSIBLES)
echo.
echo ----------------------------------------
pause

:: Test 5: Vérifier la configuration chargée dans Prometheus
echo.
echo [5/7] Lecture de la config active de Prometheus...
echo.
kubectl exec %PROM_POD% -n %NAMESPACE% -- cat /etc/prometheus/prometheus.yml | findstr "job_name"
echo.
echo ----------------------------------------
pause

:: Test 6: Vérifier l'API des targets de Prometheus
echo.
echo [6/7] Etat de sante des Targets (API Prometheus)...
echo.
:: On utilise le NodePort 30090 pour interroger l'API depuis Windows
curl -s http://localhost:30090/api/v1/targets | findstr /i "health"
echo.
echo ----------------------------------------
pause

:: Test 7: Logs d'erreurs Prometheus
echo.
echo [7/7] Analyse des erreurs dans les logs de Prometheus...
echo.
kubectl logs %PROM_POD% -n %NAMESPACE% --tail=20 | findstr /i "error fail warn"
echo.

:end
echo ========================================
echo   DIAGNOSTIC TERMINE
echo ========================================
echo.
echo Recommendations:
echo   - Si DNS [X]: Verifiez CoreDNS (kubectl get pods -n kube-system)
echo   - Si Metrics [X]: Verifiez que la dépendance 'micrometer-registry-prometheus' est dans le pom.xml
echo   - Si Targets [X]: Verifiez les Selectors de vos Services K8s.
echo.
pause