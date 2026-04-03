@echo off
REM ============================================
REM Script de Test Credentials Docker Hub
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Test Credentials Docker Hub
echo ========================================
echo.

set DOCKER_USER=houssem80356

REM 1. Vérifier que Docker est lancé
echo [1/4] Verification Docker Desktop...
docker version >nul 2>&1
if NOT %ERRORLEVEL%==0 (
    echo [ERROR] Docker Desktop n'est pas lance ou inaccessible.
    echo        Veuillez demarrer Docker Desktop et reessayer.
    pause
    exit /b 1
)
echo [OK] Docker Desktop est actif.
echo.

REM 2. Demander le mot de passe
echo [2/4] Connexion a Docker Hub...
echo Nom d'utilisateur : %DOCKER_USER%
echo.
set /p DOCKER_PASS="Entrez votre mot de passe/token Docker Hub: "

if "%DOCKER_PASS%"=="" (
    echo [ERROR] Mot de passe vide. Abandon.
    pause
    exit /b 1
)

REM 3. Tester la connexion
echo.
echo [3/4] Test de connexion...
echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin >nul 2>&1

if NOT %ERRORLEVEL%==0 (
    echo [ERROR] Echec de connexion !
    echo.
    echo Causes possibles :
    echo   - Mot de passe incorrect
    echo   - Token Docker Hub expire
    echo   - Probleme reseau
    echo.
    echo Comment obtenir un token :
    echo   1. Allez sur https://hub.docker.com/settings/security
    echo   2. Cliquez sur "New Access Token"
    echo   3. Donnez un nom (ex: jenkins-ci)
    echo   4. Copiez le token genere
    echo.
    pause
    exit /b 1
)

echo [OK] Connexion reussie !
echo.

REM 4. Tester le push d'une image test
echo [4/4] Test push d'une image (facultatif)...
set /p TEST_PUSH="Voulez-vous tester un push d'image test ? (o/n): "

if /i "%TEST_PUSH%"=="o" (
    echo.
    echo Creation d'une image de test...
    docker pull hello-world >nul 2>&1
    docker tag hello-world %DOCKER_USER%/test-jenkins:latest

    echo Push vers Docker Hub...
    docker push %DOCKER_USER%/test-jenkins:latest

    if %ERRORLEVEL%==0 (
        echo [OK] Push reussi ! Image disponible sur :
        echo     https://hub.docker.com/r/%DOCKER_USER%/test-jenkins
        echo.
        echo Vous pouvez supprimer cette image test :
        echo   docker rmi %DOCKER_USER%/test-jenkins:latest
    ) else (
        echo [ERROR] Echec du push.
    )
)

echo.
echo ========================================
echo RESULTAT DU TEST
echo ========================================
echo [SUCCESS] Credentials Docker Hub valides !
echo.
echo Configuration pour Jenkins :
echo   Username : %DOCKER_USER%
echo   Password : [Le mot de passe que vous venez d'entrer]
echo   ID Credential : docker-registry-creds
echo.
echo Prochaines etapes :
echo   1. Allez dans Jenkins ^> Manage Jenkins ^> Credentials
echo   2. Ajoutez un credential "Username with password"
echo   3. Utilisez les infos ci-dessus
echo   4. Lancez votre pipeline Jenkins
echo ========================================
echo.

pause
exit /b 0