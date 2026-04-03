@echo off
REM ============================================
REM Pre-Build Verification Script
REM Verifie que tout est pret avant de lancer Jenkins
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Pre-Build Verification - Intelligent RH
echo ========================================
echo.

set ERROR_COUNT=0
set WARNING_COUNT=0

REM ================================================
REM 1. VERIFICATION DOCKER
REM ================================================
echo [CHECK 1/8] Docker Desktop...
docker version >nul 2>&1
if %ERRORLEVEL%==0 (
    echo   [OK] Docker Desktop est actif
) else (
    echo   [ERROR] Docker Desktop n'est pas lance
    set /a ERROR_COUNT+=1
)
echo.

REM ================================================
REM 2. VERIFICATION KUBERNETES
REM ================================================
echo [CHECK 2/8] Kubernetes...
kubectl cluster-info >nul 2>&1
if %ERRORLEVEL%==0 (
    echo   [OK] Kubernetes cluster accessible
) else (
    echo   [WARNING] Kubernetes non accessible (OK si mode compose)
    set /a WARNING_COUNT+=1
)
echo.

REM ================================================
REM 3. VERIFICATION MAVEN
REM ================================================
echo [CHECK 3/8] Maven...
set MAVEN_HOME=C:\Jenkins_Session2\tools\hudson.tasks.Maven_MavenInstallation\maven3

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo   [OK] Maven trouve : %MAVEN_HOME%
) else (
    echo   [ERROR] Maven non trouve a : %MAVEN_HOME%
    echo          Verifiez le chemin dans le Jenkinsfile
    set /a ERROR_COUNT+=1
)
echo.

REM ================================================
REM 4. VERIFICATION STRUCTURE PROJET
REM ================================================
echo [CHECK 4/8] Structure du projet...
set REQUIRED_DIRS=Discovery Gateway ConfigServer Talent-Management Recruitment Kanban Scoutisme Admin_Onboarding_Service

set MISSING_DIRS=
for %%D in (%REQUIRED_DIRS%) do (
    if not exist "Intelligent_Rh_Application-master\%%D" (
        set MISSING_DIRS=!MISSING_DIRS! %%D
    )
)

if "%MISSING_DIRS%"=="" (
    echo   [OK] Tous les dossiers de services sont presents
) else (
    echo   [ERROR] Dossiers manquants : %MISSING_DIRS%
    set /a ERROR_COUNT+=1
)
echo.

REM ================================================
REM 5. VERIFICATION DOCKER-COMPOSE.YML
REM ================================================
echo [CHECK 5/8] docker-compose.yml...
if exist "docker-compose.yml" (
    echo   [OK] docker-compose.yml present
) else (
    echo   [WARNING] docker-compose.yml absent (OK si mode kubernetes)
    set /a WARNING_COUNT+=1
)
echo.

REM ================================================
REM 6. VERIFICATION MANIFESTS KUBERNETES
REM ================================================
echo [CHECK 6/8] Manifests Kubernetes...
set K8S_FILES=namespace.yaml mysql.yaml sonarqube.yaml discovery.yaml config-server.yaml gateway.yaml frontend.yaml

set MISSING_K8S=
for %%F in (%K8S_FILES%) do (
    if not exist "k8s\%%F" (
        set MISSING_K8S=!MISSING_K8S! %%F
    )
)

if "%MISSING_K8S%"=="" (
    echo   [OK] Tous les manifests K8s sont presents
) else (
    echo   [WARNING] Manifests K8s manquants : %MISSING_K8S%
    echo             (OK si mode compose uniquement)
    set /a WARNING_COUNT+=1
)
echo.

REM ================================================
REM 7. VERIFICATION CREDENTIALS DOCKER
REM ================================================
echo [CHECK 7/8] Credentials Docker Hub...
echo   Info : Impossible de verifier automatiquement
echo          Assurez-vous d'avoir cree le credential 'docker-registry-creds' dans Jenkins
echo          Username : houssem80356
echo   [INFO] A verifier manuellement dans Jenkins
echo.

REM ================================================
REM 8. VERIFICATION CONNEXION RESEAU
REM ================================================
echo [CHECK 8/8] Connexion Internet (pour Docker Hub)...
ping -n 1 hub.docker.com >nul 2>&1
if %ERRORLEVEL%==0 (
    echo   [OK] Connexion Internet OK
) else (
    echo   [WARNING] Impossible de joindre hub.docker.com
    echo             Push Docker Hub pourrait echouer
    set /a WARNING_COUNT+=1
)
echo.

REM ================================================
REM RESUME
REM ================================================
echo ========================================
echo RESUME
echo ========================================
echo Erreurs critiques : %ERROR_COUNT%
echo Avertissements    : %WARNING_COUNT%
echo.

if %ERROR_COUNT% GTR 0 (
    echo [RESULTAT] Des erreurs critiques ont ete detectees.
    echo            Corrigez-les avant de lancer le pipeline Jenkins.
    echo.
    echo Actions recommandees :
    echo   - Verifiez Docker Desktop
    echo   - Verifiez le chemin Maven
    echo   - Verifiez la structure du projet
    echo.
    pause
    exit /b 1
)

if %WARNING_COUNT% GTR 0 (
    echo [RESULTAT] Tout est OK, mais avec quelques avertissements.
    echo.
    echo Notes :
    echo   - Si vous utilisez mode 'compose' : les warnings K8s sont normaux
    echo   - Si vous utilisez mode 'kubernetes' : verifiez les warnings
    echo.
)

echo [SUCCESS] Pre-build verification complete !
echo           Vous pouvez lancer le pipeline Jenkins.
echo.

REM Afficher la configuration detectee
echo ========================================
echo CONFIGURATION DETECTEE
echo ========================================
echo Mode suggere       : [compose ou kubernetes - a configurer dans Jenkinsfile]
echo Maven Home         : %MAVEN_HOME%
echo Docker Hub User    : houssem80356
echo Namespace K8s      : intelligent-rh
echo.
echo Prochaines etapes :
echo   1. Ouvrez le Jenkinsfile
echo   2. Configurez DEPLOY_MODE = 'compose' ou 'kubernetes'
echo   3. Verifiez que les credentials Docker sont dans Jenkins
echo   4. Lancez "Build Now" dans Jenkins
echo ========================================
echo.

pause
exit /b 0