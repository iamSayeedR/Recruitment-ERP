package com.recruitmenterp.compliance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.recruitmenterp.compliance", "com.recruitmenterp.common"})
@EnableScheduling
public class ComplianceServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ComplianceServiceApplication.class, args);
    }
}
