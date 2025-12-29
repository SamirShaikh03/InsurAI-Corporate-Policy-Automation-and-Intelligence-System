package com.insurai.insurai_backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the absolute path of the uploads folder relative to the project root
        Path uploadPath = Paths.get("./uploads").toAbsolutePath().normalize();
        String uploadDir = uploadPath.toUri().toString();

        System.out.println("📁 Configured upload directory: " + uploadDir);

        // Serve /uploads/** URLs from the local folder
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadDir)
                .setCachePeriod(0) // Disable caching for development
                .resourceChain(true);
    }
}
