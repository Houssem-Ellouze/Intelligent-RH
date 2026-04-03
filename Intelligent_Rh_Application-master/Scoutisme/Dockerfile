FROM maven:3.8.5-eclipse-temurin-17 AS build

WORKDIR /app

ARG JAR_FILE=target/Scoutisme-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

# Port de ton application Spring Boot
EXPOSE 9009

ENTRYPOINT ["java", "-jar", "app.jar"]