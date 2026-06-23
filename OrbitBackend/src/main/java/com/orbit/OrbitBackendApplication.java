package com.orbit;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.orbit.entity.Admin;
import com.orbit.repository.AdminRepository;

@SpringBootApplication
public class OrbitBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrbitBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedDatabase(AdminRepository adminRepository, BCryptPasswordEncoder passwordEncoder) {
		return args -> {
			if (adminRepository.count() == 0) {
				System.out.println("Seeding default Admin accounts...");

				Admin admin1 = new Admin();
				admin1.setName("Super Admin");
				admin1.setEmail("admin@orbit.com");
				admin1.setPassword(passwordEncoder.encode("password"));
				admin1.setPhone("9999999999");
				admin1.setRole("ADMIN");
				admin1.setStatus(true);
				adminRepository.save(admin1);

				Admin admin2 = new Admin();
				admin2.setName("Atharva Suryavanshi");
				admin2.setEmail("atharvasuryavanshi10@gmail.com");
				admin2.setPassword(passwordEncoder.encode("password"));
				admin2.setPhone("8888888888");
				admin2.setRole("ADMIN");
				admin2.setStatus(true);
				adminRepository.save(admin2);

				System.out.println("Default Admins seeded successfully.");
			}
		};
	}
}
