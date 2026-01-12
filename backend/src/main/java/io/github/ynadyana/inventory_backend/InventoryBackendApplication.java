package io.github.ynadyana.inventory_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync; // Import this

@SpringBootApplication
@EnableAsync // Ensure this is here
public class InventoryBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(InventoryBackendApplication.class, args);
	}

}