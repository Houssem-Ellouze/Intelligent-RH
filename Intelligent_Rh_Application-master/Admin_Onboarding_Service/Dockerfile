FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app
ARG JAR_FILE=target/Admin_Onboarding_Service-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]