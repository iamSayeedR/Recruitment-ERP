package com.recruitmenterp.candidate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.recruitmenterp.candidate", "com.recruitmenterp.common"})
public class CandidateServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CandidateServiceApplication.class, args);
    }
}
