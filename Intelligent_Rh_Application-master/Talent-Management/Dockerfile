# Étape 1 : Build avec Maven et JDK 17 (Temurin)
FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 9002
ENTRYPOINT ["java", "-jar", "app.jar"]