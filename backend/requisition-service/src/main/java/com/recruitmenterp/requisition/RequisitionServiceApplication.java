package com.recruitmenterp.requisition;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.recruitmenterp.requisition", "com.recruitmenterp.common"})
public class RequisitionServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RequisitionServiceApplication.class, args);
    }

}
