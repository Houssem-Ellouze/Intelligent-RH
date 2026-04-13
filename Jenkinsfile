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
                    // BLOC 1 : Déploiement et mise à jour
                    bat """
                        @echo off
                        setlocal enabledelayedexpansion
                        echo ==========================================================
                        echo    INTELLIGENT RH - KUBERNETES AUTOMATED DEPLOYMENT
                        echo ==========================================================

                        :: 1. Vérification connexion
                        kubectl cluster-info >nul 2>&1
                        if !ERRORLEVEL! NEQ 0 (
                            echo [ERROR] Cluster non detecte.
                            exit /b 1
                        )

                        :: 2. Infra & DB
                        kubectl apply -f "%K8S_DIR%\\namespace.yaml"
                        kubectl apply -f "%K8S_DIR%\\sonarqube-pvc.yaml" -n %K8S_NAMESPACE%
                        kubectl apply -f "%K8S_DIR%\\mysql.yaml" -n %K8S_NAMESPACE%
                        kubectl apply -f "%K8S_DIR%\\sonardb-deployment.yaml" -n %K8S_NAMESPACE%

                        ping 127.0.0.1 -n 15 > nul

                        :: 3. Services & Ingress
                        kubectl apply -f "%K8S_DIR%\\discovery.yaml" -n %K8S_NAMESPACE%
                        kubectl apply -f "%K8S_DIR%\\config-server.yaml" -n %K8S_NAMESPACE%
                        kubectl apply -f "%K8S_DIR%\\gateway.yaml" -n %K8S_NAMESPACE%
                        kubectl apply -f "%K8S_DIR%\\services" -n %K8S_NAMESPACE%
                        kubectl apply -f "%K8S_DIR%\\frontend.yaml" -n %K8S_NAMESPACE%
                        kubectl apply -f "%K8S_DIR%\\ingress.yaml" -n %K8S_NAMESPACE%
                        kubectl apply -f "%K8S_DIR%\\maildev.yaml" -n %K8S_NAMESPACE%


                        :: 4. Rolling Update
                        kubectl set image deployment/discovery discovery=%DOCKER_USER%/intelligent-app2-discovery:%IMAGE_TAG% -n %K8S_NAMESPACE%
                        kubectl set image deployment/gateway gateway=%DOCKER_USER%/intelligent-app2-gateway:%IMAGE_TAG% -n %K8S_NAMESPACE%
                        kubectl set image deployment/config-server config-server=%DOCKER_USER%/intelligent-app2-config-server:%IMAGE_TAG% -n %K8S_NAMESPACE%
                        kubectl set image deployment/frontend frontend=%DOCKER_USER%/intelligent-app2-frontend:%IMAGE_TAG% -n %K8S_NAMESPACE%
                    """

                    // PAUSE ICI : On attend que Kubernetes travaille avant de vérifier l'état
                    echo "⏳ Stabilisation du cluster en cours (45s)..."
                    sleep 45

                    // BLOC 2 : Vérification finale
                    bat """
                        echo ==========================================================
                        echo    ETAT DU NAMESPACE : %K8S_NAMESPACE%
                        echo ==========================================================
                        kubectl get pods -n %K8S_NAMESPACE%
                        echo.
                        kubectl get ingress -n %K8S_NAMESPACE%
                        echo.
                        echo [SUCCESS] Deploiement Kubernetes termine !
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
                        echo ============================================================
                        echo   Deployment Monitoring (Full) - Intelligent RH
                        echo ============================================================
                        echo.

                        set "NAMESPACE=${K8S_NAMESPACE}"
                        set "K8S_DIR=${K8S_DIR}"
                        set "MONITORING_DIR=${MONITORING_DIR}"

                        :: Vérification de la connexion
                        kubectl cluster-info >nul 2>&1
                        if !ERRORLEVEL! NEQ 0 (
                            echo [ERROR] Impossible de se connecter au cluster Kubernetes.
                            exit /b 1
                        )

                        echo [STEP 1/6] Preparation du namespace...
                        kubectl apply -f "!K8S_DIR!\\namespace.yaml"

                        echo [STEP 2/6] Application des PVC...
                        kubectl apply -f "!MONITORING_DIR!\\monitoring-pvc.yaml" -n !NAMESPACE!
                        kubectl apply -f "!K8S_DIR!\\prometheus-pvc.yaml" -n !NAMESPACE!
                        kubectl apply -f "!K8S_DIR!\\sonarqube-pvc.yaml" -n !NAMESPACE!

                        echo [STEP 3/6] Deploiement de Prometheus...
                        kubectl apply -f "!MONITORING_DIR!\\prometheus-configmap.yaml" -n !NAMESPACE!
                        kubectl apply -f "!MONITORING_DIR!\\prometheus-deployment.yaml" -n !NAMESPACE!

                        echo [STEP 4/6] Deploiement de Grafana...
                        kubectl apply -f "!MONITORING_DIR!\\grafana-configmap.yaml" -n !NAMESPACE!
                        kubectl apply -f "!MONITORING_DIR!\\grafana-deployment.yaml" -n !NAMESPACE!

                        echo [STEP 5/6] Deploiement de SonarQube...
                        kubectl apply -f "!K8S_DIR!\\sonarqube.yaml" -n !NAMESPACE!
                        kubectl apply -f "!K8S_DIR!\\sonarqube-deployment.yaml" -n !NAMESPACE!

                        echo [STEP 6/6] Configuration Ingress...
                        kubectl apply -f "!K8S_DIR!\\ingress.yaml" -n !NAMESPACE!

                        echo [INFO] Activation du Port-Forward Kanban (8088)...
                        for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8088') do taskkill /f /pid %%a 2>nul
                        start /b kubectl port-forward svc/kanban-backend 8088:8088 -n !NAMESPACE! >nul 2>&1

                        echo.
                        echo ============================================================
                        echo   ACCES VIA : http://intelligent-rh/
                        echo ============================================================
                        echo Prometheus : /prometheus
                        echo Grafana    : /grafana
                        echo SonarQube  : /sonarqube
                        echo Kanban     : http://localhost:8088
                        echo ============================================================
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