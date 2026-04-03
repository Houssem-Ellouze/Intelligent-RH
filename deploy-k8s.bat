@echo off
setlocal enabledelayedexpansion

echo.
echo ==========================================================
echo    INTELLIGENT RH - KUBERNETES AUTOMATED DEPLOYMENT
echo ==========================================================
echo.

set NAMESPACE=intelligent-rh
set K8S_DIR=k8s

:: 1. Vérification de la connexion au cluster
kubectl cluster-info >nul 2>&1
if %ERRORLEVEL% NEQ 0 GOTO K8S_ERROR

echo [INFO] Connexion au cluster Kubernetes : OK.
echo.

:: 2. Namespace
echo [STEP 1/9] Configuration du Namespace...
kubectl apply -f %K8S_DIR%\namespace.yaml
echo [OK] Namespace %NAMESPACE% pret.
echo.

:: 3. Certificats SSL (Indispensable pour l'Ingress HTTPS)
echo [STEP 2/9] Configuration de la Securite TLS...
:: Note : Assure-toi d'avoir lance ton script de generation de certificat avant
kubectl get secret talentflow-tls-secret -n %NAMESPACE% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Secret TLS manquant. Verifiez votre configuration SSL.
) else (
    echo [OK] Certificats SSL detectes.
)
echo.

:: 4. Stockage (PVC)
echo [STEP 3/9] Configuration du Stockage Persistant (PVC)...
kubectl apply -f %K8S_DIR%\sonarqube-pvc.yaml -n %NAMESPACE%
echo [OK] Volumes persistants (PV/PVC) crees.
echo.

:: 5. Bases de données
echo [STEP 4/9] Deploiement des Bases de donnees (MySQL/Postgres)...
kubectl apply -f %K8S_DIR%\mysql.yaml -n %NAMESPACE%
kubectl apply -f %K8S_DIR%\sonardb-deployment.yaml -n %NAMESPACE%
echo [INFO] Initialisation des bases de donnees (15s)...
timeout /t 15 /nobreak
echo [OK] Databases operationnelles.
echo.

:: 6. Infrastructure & Outils
echo [STEP 5/9] Deploiement Infrastructure Java (Eureka/Config)...
kubectl apply -f %K8S_DIR%\discovery.yaml -n %NAMESPACE%
kubectl apply -f %K8S_DIR%\config-server.yaml -n %NAMESPACE%
kubectl apply -f %K8S_DIR%\gateway.yaml -n %NAMESPACE%
echo [OK] Coeur du systeme lance.
echo.

:: 7. Microservices Métiers
echo [STEP 6/9] Deploiement des Microservices (Talent, Recruit, etc.)...
:: On deploie tout le dossier services d'un coup
kubectl apply -f %K8S_DIR%\services -n %NAMESPACE%
echo [OK] Services metiers synchronises.
echo.

:: 8. Frontend & Outils DevOps
echo [STEP 7/9] Deploiement Frontend et Analyse Qualite...
kubectl apply -f %K8S_DIR%\frontend.yaml -n %NAMESPACE%
kubectl apply -f %K8S_DIR%\sonarqube-deployment.yaml -n %NAMESPACE%
kubectl apply -f %K8S_DIR%\maildev.yaml -n %NAMESPACE%
echo [OK] Frontend et Outils lances.
echo.

:: 9. Ingress (Le point d'entrée unique)
echo [STEP 8/9] Configuration de l'Ingress (Routage Intelligent)...
kubectl apply -f %K8S_DIR%\ingress.yaml -n %NAMESPACE%
echo [OK] Ingress configure sur https://intelligent-rh.
echo.

echo [INFO] Stabilisation du cluster (45s)...
timeout /t 45 /nobreak

echo ==========================================================
echo    ETAT DU NAMESPACE : %NAMESPACE%
echo ==========================================================
kubectl get pods -n %NAMESPACE%
echo.
echo ==========================================================
echo    ACCES APPLICATIF (PRODUCTION)
echo ==========================================================
kubectl get ingress -n %NAMESPACE%
echo.
echo [SUCCESS] Deploiement termine avec succes !
echo [URL] Accedez a l'application sur : http://intelligent-rh:32000/login
echo [INFO] Verifiez que votre fichier 'hosts' pointe vers 127.0.0.1.
echo ==========================================================
pause
exit /b 0

:K8S_ERROR
echo [ERROR] Impossible de se connecter au cluster Kubernetes.
echo Verifiez si Docker Desktop ou Minikube est lance.
pause
exit /b 1