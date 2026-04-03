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
        TOKEN_Discovery    = 'sqp_bef121ff6f81c9c764b97e4ea2e6b9664351e23d'
        TOKEN_Gateway      = 'sqp_35e9db93c0293454c81dfd373fb6a76d22ed717c'
        TOKEN_ConfigServer = 'sqp_21453bac15d59d3c68d3945ebcbb1ff58cffa3a2'
        TOKEN_Talent       = 'sqp_3849788c4b6e0454658ca8b256c4582ae5d937eb'
        TOKEN_Recruitment  = 'sqp_28573b3b694333cc398cb009ff380999d43dd13a'
        TOKEN_Onboarding   = 'sqp_d98b70fa114c8cf628aca141e11ffa123f5d1a57'
        TOKEN_Board        = 'sqp_cf8b74c5498afd79898e2ece3fbc8122960a958f'
        TOKEN_Scoutisme    = 'sqp_b7f598dd0a0175ffcb3a3f816390fb00f28abad7'

        // --- Kubernetes ---
        K8S_NAMESPACE = 'intelligent-rh'
        K8S_DIR       = 'k8s'
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
                        set NS=${K8S_NAMESPACE}

                        echo [1/4] Namespace & Infra Base...
                        kubectl apply -f ${K8S_DIR}\\namespace.yaml
                        kubectl apply -f ${K8S_DIR}\\sonarqube-pvc.yaml -n %NS%
                        kubectl apply -f ${K8S_DIR}\\mysql.yaml -n %NS%
                        kubectl apply -f ${K8S_DIR}\\sonardb-deployment.yaml -n %NS%
                        kubectl apply -f ${K8S_DIR}\\maildev.yaml -n %NS%

                        echo [2/4] App Core...
                        kubectl apply -f ${K8S_DIR}\\discovery.yaml -n %NS%
                        kubectl apply -f ${K8S_DIR}\\config-server.yaml -n %NS%
                        kubectl apply -f ${K8S_DIR}\\gateway.yaml -n %NS%
                        kubectl apply -f ${K8S_DIR}\\admin-user.yaml -n %NS%

                        echo [3/4] Microservices & Frontend...
                        kubectl apply -f ${K8S_DIR}\\services -n %NS%
                        kubectl apply -f ${K8S_DIR}\\frontend.yaml -n %NS%
                        kubectl apply -f ${K8S_DIR}\\ingress.yaml -n %NS%

                        echo [4/4] Image Updates...
                        kubectl set image deployment/discovery discovery=${DOCKER_USER}/intelligent-app2-discovery:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/gateway gateway=${DOCKER_USER}/intelligent-app2-gateway:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/config-server config-server=${DOCKER_USER}/intelligent-app2-config-server:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/talent-management-service talent-management-service=${DOCKER_USER}/intelligent-app2-talent-management-service:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/recrutement-service recrutement-service=${DOCKER_USER}/intelligent-app2-recrutement-service:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/scoutisme-service scoutisme-service=${DOCKER_USER}/intelligent-app2-scoutisme-service:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/kanban-backend kanban-backend=${DOCKER_USER}/intelligent-app2-kanban-backend:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/admin-contract-onboarding-service admin-contract-onboarding-service=${DOCKER_USER}/intelligent-app2-admin-contract-onboarding-service:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/job-prediction job-prediction=${DOCKER_USER}/intelligent-app2-job-prediction:${IMAGE_TAG} -n %NS%
                        kubectl set image deployment/frontend frontend=${DOCKER_USER}/intelligent-app2-frontend:${IMAGE_TAG} -n %NS%
                    """
                }
            }
        }
    }

    post {
        success { echo "✅ Success!" }
        failure { echo "❌ Failed!" }
    }
}