# Étape 1 : Build avec Maven et JDK 17 (Temurin)
FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
ARG JAR_FILE=target/Recruitment-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]