package com.java.ne;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/*
 * Application entry point. Scheduling is enabled so pending notifications can be emailed.
 */
@SpringBootApplication
@EnableScheduling
public class NeApplication {

    public static void main(String[] args) {
        SpringApplication.run(NeApplication.class, args);
    }

}
