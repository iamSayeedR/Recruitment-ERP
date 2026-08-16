# Multi-stage Dockerfile for Recruitment ERP Backend
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Copy root pom and module poms
COPY pom.xml .
COPY platform-common/pom.xml platform-common/
COPY iam-service/pom.xml iam-service/
COPY requisition-service/pom.xml requisition-service/
COPY candidate-service/pom.xml candidate-service/
COPY compliance-service/pom.xml compliance-service/
COPY gateway-service/pom.xml gateway-service/

# Copy module source code
COPY platform-common/src platform-common/src
COPY iam-service/src iam-service/src
COPY requisition-service/src requisition-service/src
COPY candidate-service/src candidate-service/src
COPY compliance-service/src compliance-service/src
COPY gateway-service/src gateway-service/src

# Build Maven artifacts
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S erp && adduser -S erp -G erp
USER erp
WORKDIR /app

COPY --from=builder /build/gateway-service/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
