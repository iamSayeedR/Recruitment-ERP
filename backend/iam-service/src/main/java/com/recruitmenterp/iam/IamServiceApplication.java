package com.recruitmenterp.iam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application entry point for the IAM Service.
 */
@SpringBootApplication(scanBasePackages = {"com.recruitmenterp.iam", "com.recruitmenterp.common"})
public class IamServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IamServiceApplication.class, args);
    }
}
