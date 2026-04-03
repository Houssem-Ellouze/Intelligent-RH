FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app
ARG JAR_FILE=target/Discovery-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]