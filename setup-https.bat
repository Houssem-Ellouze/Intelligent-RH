@echo off
setlocal enabledelayedexpansion

:: --- CONFIGURATION ---
set NAMESPACE=intelligent-rh
set SECRET_NAME=talentflow-tls-secret
set CN=intelligent-rh

echo ==========================================================
echo    CONFIGURATION HTTPS / SSL (AVEC SAN) POUR TALENTFLOW
echo ==========================================================

:: 1. VÉRIFICATION D'OPENSSL
echo [1/5] Verification de l'installation d'OpenSSL...
where openssl >nul 2>nul
if errorlevel 1 (
    echo [ERREUR] openssl.exe introuvable dans votre PATH.
    echo Installez Git pour Windows ou OpenSSL Windows.
    pause
    exit /b 1
)

:: 2. RECHERCHE D'OPENSSL.CNF
echo [2/5] Recherche de la configuration OpenSSL...
if exist "C:\Program Files\Git\usr\ssl\openssl.cnf" (
    set "OPENSSL_CONF=C:\Program Files\Git\usr\ssl\openssl.cnf"
) else if exist "C:\Program Files\Common Files\SSL\openssl.cnf" (
    set "OPENSSL_CONF=C:\Program Files\Common Files\SSL\openssl.cnf"
) else (
    echo [AVERTISSEMENT] openssl.cnf standard introuvable. Utilisation du defaut systeme.
)

:: 3. GÉNÉRATION DES CERTIFICATS (AVEC SAN)
echo [3/5] Generation du certificat auto-signe (SAN inclus)...

:: Correction : On s'assure que le SAN est correctement passe pour Windows
openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
  -keyout tls.key -out tls.crt ^
  -subj "/CN=%CN%" ^
  -addext "subjectAltName = DNS:%CN%"

if errorlevel 1 (
    echo [ERREUR] La generation des cles a echoue.
    pause
    exit /b 1
)

:: 4. NETTOYAGE DU SECRET EXISTANT
echo [4/5] Nettoyage de l'ancien secret dans Kubernetes...
kubectl delete secret %SECRET_NAME% -n %NAMESPACE% --ignore-not-found

:: 5. CRÉATION DU SECRET TLS
echo [5/5] Creation du secret TLS dans le namespace %NAMESPACE%...
kubectl create secret tls %SECRET_NAME% --key tls.key --cert tls.crt -n %NAMESPACE%

echo.
echo ==========================================================
echo    TERMINE AVEC SUCCÈS !
echo ==========================================================
echo.
echo Statut du secret :
kubectl get secret %SECRET_NAME% -n %NAMESPACE%
echo.
echo Rappel : Appliquez votre Ingress : 'kubectl apply -f ingress.yaml'
echo ==========================================================
pause