FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S erp && adduser -S erp -G erp
USER erp
WORKDIR /app
COPY target/candidate-service-0.1.0-SNAPSHOT.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "--enable-preview", "-jar", "app.jar"]
