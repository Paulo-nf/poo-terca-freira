package com.arenape.webapi.config;

import com.arenape.webapi.entity.User;
import com.arenape.webapi.entity.enums.UserRole;
import com.arenape.webapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedAdmin() {
        return args -> {
            if (!userRepository.existsByEmail("admin@arenape.com")) {
                User admin = new User();
                admin.setName("Administrador");
                admin.setEmail("admin@arenape.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);
                System.out.println(">>> Admin criado: admin@arenape.com / admin123");
            }
        };
    }
}