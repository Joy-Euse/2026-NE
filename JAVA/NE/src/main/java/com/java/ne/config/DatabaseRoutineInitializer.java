package com.java.ne.config;

/*
 * Installs PostgreSQL routines that use dollar-quoted PL/pgSQL blocks.
 * Spring's SQL data initializer splits scripts on semicolons, which breaks these routines.
 */
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseRoutineInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        ClassPathResource routines = new ClassPathResource("db/routines.sql");
        String sql = new String(routines.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        jdbcTemplate.execute(sql);
        log.info("Database routines installed from db/routines.sql");
    }
}
