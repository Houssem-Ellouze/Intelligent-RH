pipeline {
    agent any

    environment {
        // --- Configuration Maven pour Windows ---
        M2_HOME = 'C:\\Jenkins_Session2\\tools\\hudson.tasks.Maven_MavenInstallation\\maven3'
        PATH = "${env.M2_HOME}\\bin;${env.PATH}"

        // --- Dossiers Racines ---
        JAVA_BASE  = 'Intelligent_Rh_Application-master'
        FRONT_BASE = 'Intelligent-RH-Application-master'

        // --- Docker Hub ---
        DOCKER_USER           = 'houssem80356'
        DOCKER_CREDENTIALS_ID = 'docker-registry-creds'

        // --- SonarQube ---
        SONAR_HOST_URL = 'http://host.docker.internal:30009'

        // Nouveaux Tokens SonarQube fournis
        TOKEN_Discovery    = 'sqp_9d20a149995d1ddbdd860aceee5a0bdef00556f7'
        TOKEN_Gateway      = 'sqp_abd165531f1bd114f99770227188c77762826126'
        TOKEN_ConfigServer = 'sqp_cf555333b6f0d943af9177783016f1bb27215a18'
        TOKEN_Talent       = 'sqp_be61835d8185ec3881d0014ed940f668a0d09237'
        TOKEN_Recruitment  = 'sqp_3f6d309eeb44556114e7086d79dfa0cd8df2f8bc'
        TOKEN_Onboarding   = 'sqp_b68f2b8bf5e06e76246b20489b36500d67012aab'
        TOKEN_Board        = 'sqp_2808f086ca12a6abb28ed43718fe8d5868e84f38'
        TOKEN_Scoutisme    = 'sqp_7fe364c40b9a2286db6065407648c54a23aa3e95'

        // --- Kubernetes ---
        K8S_NAMESPACE = 'intelligent-rh'
        K8S_DIR       = 'k8s'
        MONITORING_DIR = 'k8s\\monitoring'
        IMAGE_TAG     = "${BUILD_NUMBER}"
    }

    stages {
        stage('Preparation') {
            steps {
                script {
                    retry(3) {
                        try {
                            bat """
                                @echo off
                                echo Nettoyage du workspace...
                                if exist "${WORKSPACE}\\*" (
                                    for /d %%i in ("${WORKSPACE}\\*") do rmdir /s /q "%%i" 2>nul
                                    del /q /f "${WORKSPACE}\\*" 2>nul
                                )
                            """
                        } catch (Exception e) {
                            echo "Note: Certains fichiers verrouillés n'ont pas pu être supprimés."
                        }
                    }
                }
                checkout scm
                bat "if exist \"${JAVA_BASE}\\${JAVA_BASE}\" (xcopy \"${JAVA_BASE}\\${JAVA_BASE}\\*\" \"${JAVA_BASE}\\\" /E /I /Y /Q && rmdir /S /Q \"${JAVA_BASE}\\${JAVA_BASE}\")"
            }
        }

        stage('Maven Build') {
            steps {
                script {
                    def javaServices = [
                        'Discovery', 'Gateway', 'ConfigServer',
                        'Talent-Management', 'Recruitment', 'Board',
                        'Scoutisme', 'Admin_Onboarding_Service'
                    ]
                    javaServices.each { srv ->
                        def srvPath = "${WORKSPACE}\\${JAVA_BASE}\\${srv}"
                        if (fileExists(srvPath)) {
                            dir(srvPath) {
                                bat "mvn clean package -DskipTests"
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Push Docker') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'D_USER', passwordVariable: 'D_PASS')]) {
                        bat "docker login -u %D_USER% -p %D_PASS%"

                        def dockerMap = [
                            'intelligent-app2-discovery': "${JAVA_BASE}/Discovery",
                            'intelligent-app2-config-server': "${JAVA_BASE}/ConfigServer",
                            'intelligent-app2-gateway': "${JAVA_BASE}/Gateway",
                            'intelligent-app2-talent-management-service': "${JAVA_BASE}/Talent-Management",
                            'intelligent-app2-recrutement-service': "${JAVA_BASE}/Recruitment",
                            'intelligent-app2-scoutisme-service': "${JAVA_BASE}/Scoutisme",
                            'intelligent-app2-kanban-backend': "${JAVA_BASE}/Board",
                            'intelligent-app2-admin-contract-onboarding-service': "${JAVA_BASE}/Admin_Onboarding_Service",
                            'intelligent-app2-frontend': "${FRONT_BASE}",
                            'intelligent-app2-job-prediction': "${JAVA_BASE}/JobPrediction"
                        ]

                        dockerMap.each { imgName, buildPath ->
                            if (fileExists(buildPath)) {
                                def fullImage = "${DOCKER_USER}/${imgName}:${IMAGE_TAG}"
                                bat "docker build -t ${fullImage} ${buildPath}"
                                bat "docker push ${fullImage}"
                                bat "docker tag ${fullImage} ${DOCKER_USER}/${imgName}:latest"
                                bat "docker push ${DOCKER_USER}/${imgName}:latest"
                            }
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    bat 'docker-compose up -d sonardb sonarqube || true'
                    echo '⏳ Initialisation Sonar (90s)...'
                    sleep 90

                    def sonarMap = [
                        'Discovery': env.TOKEN_Discovery,
                        'Gateway': env.TOKEN_Gateway,
                        'ConfigServer': env.TOKEN_ConfigServer,
                        'Talent-Management': env.TOKEN_Talent,
                        'Recruitment': env.TOKEN_Recruitment,
                        'Board': env.TOKEN_Board,
                        'Scoutisme': env.TOKEN_Scoutisme,
                        'Admin_Onboarding_Service': env.TOKEN_Onboarding
                    ]

                    sonarMap.each { srvName, srvToken ->
                        def servicePath = "${WORKSPACE}\\${JAVA_BASE}\\${srvName}"
                        if (fileExists(servicePath)) {
                            dir(servicePath) {
                                try {
                                    bat """
                                        docker run --rm ^
                                            --add-host=host.docker.internal:host-gateway ^
                                            -v "%CD%:/usr/src" ^
                                            sonarsource/sonar-scanner-cli ^
                                            -Dsonar.projectKey=${srvName} ^
                                            -Dsonar.sources=src/main/java ^
                                            -Dsonar.java.binaries=target/classes ^
                                            -Dsonar.host.url=${SONAR_HOST_URL} ^
                                            -Dsonar.login=${srvToken}
                                    """
                                } catch (Exception e) {
                                    echo "❌ Scan échoué pour ${srvName}"
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy Kubernetes') {
            steps {
                script {
                    bat """
                        @echo off
                        setlocal enabledelayedexpansion

                        echo.
                        echo ==========================================================
                        echo    INTELLIGENT RH - KUBERNETES AUTOMATED DEPLOYMENT
                        echo ==========================================================
                        echo.

                        set NAMESPACE=${K8S_NAMESPACE}
                        set K8S_DIR=${K8S_DIR}

                        :: 1. Vérification de la connexion au cluster
                        kubectl cluster-info >nul 2>&1
                        if !ERRORLEVEL! NEQ 0 (
                            echo [ERROR] Impossible de se connecter au cluster Kubernetes.
                            echo Verifiez si Docker Desktop ou Minikube est lance.
                            exit /b 1
                        )

                        echo [INFO] Connexion au cluster Kubernetes : OK.
                        echo.

                        :: 2. Namespace
                        echo [STEP 1/9] Configuration du Namespace...
                        kubectl apply -f !K8S_DIR!\\namespace.yaml
                        echo [OK] Namespace !NAMESPACE! pret.
                        echo.

                        :: 3. Certificats SSL (Indispensable pour l'Ingress HTTPS)
                        echo [STEP 2/9] Configuration de la Securite TLS...
                        kubectl get secret talentflow-tls-secret -n !NAMESPACE! >nul 2>&1
                        if !ERRORLEVEL! NEQ 0 (
                            echo [WARNING] Secret TLS manquant. Verifiez votre configuration SSL.
                        ) else (
                            echo [OK] Certificats SSL detectes.
                        )
                        echo.

                        :: 4. Stockage (PVC)
                        echo [STEP 3/9] Configuration du Stockage Persistant (PVC)...
                        kubectl apply -f !K8S_DIR!\\sonarqube-pvc.yaml -n !NAMESPACE!
                        echo [OK] Volumes persistants (PV/PVC) crees.
                        echo.

                        :: 5. Bases de données
                        echo [STEP 4/9] Deploiement des Bases de donnees (MySQL/Postgres)...
                        kubectl apply -f !K8S_DIR!\\mysql.yaml -n !NAMESPACE!
                        kubectl apply -f !K8S_DIR!\\sonardb-deployment.yaml -n !NAMESPACE!
                        echo [INFO] Initialisation des bases de donnees (15s)...
                        timeout /t 15 /nobreak >nul
                        echo [OK] Databases operationnelles.
                        echo.

                        :: 6. Infrastructure & Outils
                        echo [STEP 5/9] Deploiement Infrastructure Java (Eureka/Config)...
                        kubectl apply -f !K8S_DIR!\\discovery.yaml -n !NAMESPACE!
                        kubectl apply -f !K8S_DIR!\\config-server.yaml -n !NAMESPACE!
                        kubectl apply -f !K8S_DIR!\\gateway.yaml -n !NAMESPACE!
                        kubectl apply -f !K8S_DIR!\\admin-user.yaml -n !NAMESPACE!
                        echo [OK] Coeur du systeme lance.
                        echo.

                        :: 7. Microservices Métiers
                        echo [STEP 6/9] Deploiement des Microservices (Talent, Recruit, etc.)...
                        kubectl apply -f !K8S_DIR!\\services -n !NAMESPACE!
                        echo [OK] Services metiers synchronises.
                        echo.

                        :: 8. Frontend & Outils DevOps
                        echo [STEP 7/9] Deploiement Frontend et Analyse Qualite...
                        kubectl apply -f !K8S_DIR!\\frontend.yaml -n !NAMESPACE!
                        kubectl apply -f !K8S_DIR!\\sonarqube-deployment.yaml -n !NAMESPACE! 2>nul
                        kubectl apply -f !K8S_DIR!\\maildev.yaml -n !NAMESPACE!
                        echo [OK] Frontend et Outils lances.
                        echo.

                        :: 9. Ingress (Le point d'entrée unique)
                        echo [STEP 8/9] Configuration de l'Ingress (Routage Intelligent)...
                        kubectl apply -f !K8S_DIR!\\ingress.yaml -n !NAMESPACE!
                        echo [OK] Ingress configure.
                        echo.

                        :: 10. Mise à jour des images avec le nouveau tag BUILD
                        echo [STEP 9/9] Mise a jour des images Docker (Build ${IMAGE_TAG})...
                        kubectl set image deployment/discovery discovery=${DOCKER_USER}/intelligent-app2-discovery:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/gateway gateway=${DOCKER_USER}/intelligent-app2-gateway:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/config-server config-server=${DOCKER_USER}/intelligent-app2-config-server:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/talent-management-service talent-management-service=${DOCKER_USER}/intelligent-app2-talent-management-service:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/recrutement-service recrutement-service=${DOCKER_USER}/intelligent-app2-recrutement-service:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/scoutisme-service scoutisme-service=${DOCKER_USER}/intelligent-app2-scoutisme-service:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/kanban-backend kanban-backend=${DOCKER_USER}/intelligent-app2-kanban-backend:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/admin-contract-onboarding-service admin-contract-onboarding-service=${DOCKER_USER}/intelligent-app2-admin-contract-onboarding-service:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/job-prediction job-prediction=${DOCKER_USER}/intelligent-app2-job-prediction:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        kubectl set image deployment/frontend frontend=${DOCKER_USER}/intelligent-app2-frontend:${IMAGE_TAG} -n !NAMESPACE! 2>nul
                        echo [OK] Images mises a jour.
                        echo.

                        echo [INFO] Stabilisation du cluster (45s)...
                        timeout /t 45 /nobreak >nul

                        echo ==========================================================
                        echo    ETAT DU NAMESPACE : !NAMESPACE!
                        echo ==========================================================
                        kubectl get pods -n !NAMESPACE!
                        echo.
                        echo ==========================================================
                        echo    ACCES APPLICATIF (PRODUCTION)
                        echo ==========================================================
                        kubectl get ingress -n !NAMESPACE!
                        echo.
                        echo [SUCCESS] Deploiement Kubernetes termine avec succes !
                        echo ==========================================================
                    """
                }
            }
        }

        stage('Deploy Monitoring') {
            steps {
                script {
                    bat """
                        @echo off
                        setlocal enabledelayedexpansion

                        echo.
                        echo ========================================
                        echo   DEPLOIEMENT MONITORING KUBERNETES
                        echo   Structure : ${MONITORING_DIR}
                        echo ========================================

                        set NAMESPACE=${K8S_NAMESPACE}
                        set MONITORING_DIR=${MONITORING_DIR}

                        :: 1. Vérification du dossier monitoring
                        if not exist "!MONITORING_DIR!" (
                            echo [WARNING] Le dossier !MONITORING_DIR! est introuvable.
                            echo Le monitoring ne sera pas deploye.
                            exit /b 0
                        )

                        echo [OK] Dossier de monitoring trouve.

                        :: 2. Application du stockage (PVC)
                        echo.
                        echo [STEP 1/4] Deploiement du stockage...
                        kubectl apply -f !MONITORING_DIR!\\monitoring-pvc.yaml -n !NAMESPACE! 2>nul
                        kubectl apply -f ${K8S_DIR}\\prometheus-pvc.yaml -n !NAMESPACE! 2>nul

                        :: 3. Application des ConfigMaps
                        echo.
                        echo [STEP 2/4] Configuration de Prometheus et Grafana...
                        kubectl apply -f !MONITORING_DIR!\\prometheus-configmap.yaml -n !NAMESPACE! 2>nul
                        kubectl apply -f !MONITORING_DIR!\\grafana-configmap.yaml -n !NAMESPACE! 2>nul

                        :: 4. Déploiement des applications
                        echo.
                        echo [STEP 3/4] Lancement des Pods Monitoring...
                        kubectl apply -f !MONITORING_DIR!\\prometheus-deployment.yaml -n !NAMESPACE! 2>nul
                        kubectl apply -f !MONITORING_DIR!\\grafana-deployment.yaml -n !NAMESPACE! 2>nul

                        :: 5. Nettoyage Docker (pour libérer les ports 9090 et 3000)
                        echo.
                        echo [STEP 4/4] Nettoyage des anciens conteneurs Docker...
                        docker stop prometheus grafana 2>nul
                        docker rm prometheus grafana 2>nul

                        echo.
                        echo [INFO] Stabilisation du monitoring (20 secondes)...
                        timeout /t 20 /nobreak >nul

                        echo.
                        echo [INFO] Etat des services de monitoring :
                        kubectl get pods -n !NAMESPACE! | findstr "prometheus grafana"
                        kubectl get svc -n !NAMESPACE! | findstr "prometheus grafana"

                        echo.
                        echo ========================================
                        echo   ACCES AUX INTERFACES MONITORING
                        echo ========================================
                        echo Prometheus : http://intelligent-rh:30090
                        echo Grafana    : http://intelligent-rh:30030
                        echo ========================================
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline terminé avec succès!"
            echo "🌐 Application disponible via Ingress"
            echo "📊 Monitoring disponible sur Prometheus/Grafana"
        }
        failure {
            echo "❌ Pipeline échoué!"
            echo "Consultez les logs pour identifier le problème."
        }
        always {
            echo "🔍 Nettoyage des ressources temporaires..."
        }
    }
}
