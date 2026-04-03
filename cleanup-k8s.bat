@echo off
setlocal enabledelayedexpansion

REM ============================================
REM Kubernetes Cleanup Script - Intelligent RH
REM ============================================

echo.
echo ========================================
echo Intelligent RH - Kubernetes Cleanup
echo ========================================
echo.

set NAMESPACE=intelligent-rh

echo [WARNING] Ce script va supprimer TOUTES les ressources du namespace : %NAMESPACE%
echo.
set /p CONFIRM="Etes-vous sur de vouloir tout supprimer ? (yes/no) : "

if /i not "%CONFIRM%"=="yes" (
    echo [INFO] Nettoyage annule.
    pause
    exit /b 0
)

echo.
echo [1/6] Suppression des Ingress (Acces Web)...
kubectl delete ingress --all -n %NAMESPACE% --ignore-not-found

echo [2/6] Suppression des Deployments (Microservices)...
kubectl delete deployments --all -n %NAMESPACE% --ignore-not-found

echo [3/6] Suppression des Services (Réseau interne)...
kubectl delete services --all -n %NAMESPACE% --ignore-not-found

echo [4/6] Suppression des PVC (Stockage persistant)...
kubectl delete pvc --all -n %NAMESPACE% --ignore-not-found

echo [5/6] Suppression des ConfigMaps et Secrets...
kubectl delete configmaps --all -n %NAMESPACE% --ignore-not-found
kubectl delete secrets --all -n %NAMESPACE% --ignore-not-found

echo [6/6] Suppression du Namespace...
kubectl delete namespace %NAMESPACE% --wait=true

echo.
echo ========================================
echo [SUCCESS] Nettoyage complet termine !
echo ========================================
echo.
pause
exit /b 0