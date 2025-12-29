package com.insurai.insurai_backend.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Optional;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.insurai.insurai_backend.model.Employee;
import com.insurai.insurai_backend.repository.EmployeeRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final JavaMailSender mailSender; // For sending emails

    // TODO: Replace with your actual secret key from application.properties or environment variable
    private final String jwtSecret = "YOUR_SECRET_KEY_HERE";

    /**
     * Registers a new employee.
     * Assumes password is already encoded and role is set in controller.
     */
    public Employee register(Employee employee) {
        return employeeRepository.save(employee);
    }

    /**
     * Validate employee credentials.
     */
    public boolean validateCredentials(Employee employee, String rawPassword, PasswordEncoder passwordEncoder) {
        return passwordEncoder.matches(rawPassword, employee.getPassword());
    }

    // -------------------- Generate simple token for Employee --------------------
    public String generateEmployeeToken(String identifier) {
        String tokenData = identifier + ":" + System.currentTimeMillis();
        return Base64.getEncoder().encodeToString(tokenData.getBytes(StandardCharsets.UTF_8));
    }

    // -------------------- Verify employee token (JWT version) --------------------
    public boolean isEmployee(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;

        try {
            String token = authHeader.substring(7).trim();
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            return employeeRepository.findByEmail(email).isPresent();

        } catch (Exception e) {
            System.out.println("[EmployeeService] JWT validation failed: " + e.getMessage());
            return false;
        }
    }

    // -------------------- Get Employee object from JWT token --------------------
    public Employee getEmployeeFromToken(String token) {
        if (token == null || token.isEmpty()) return null;

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            return employeeRepository.findByEmail(email).orElse(null);

        } catch (Exception e) {
            System.out.println("[EmployeeService] Failed to get employee from token: " + e.getMessage());
            return null;
        }
    }

    // -------------------- Lookup Employee by Email --------------------
    public Employee findByEmail(String email) {
        return employeeRepository.findByEmail(email).orElse(null);
    }

    // -------------------- Lookup Employee by Employee ID --------------------
    public Employee findByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeId(employeeId).orElse(null);
    }

    // -------------------- Send Reset Password Email --------------------
    public void sendResetPasswordEmail(String email, String token) {
        Optional<Employee> optionalEmp = employeeRepository.findByEmail(email);
        if (optionalEmp.isEmpty()) return;

        Employee emp = optionalEmp.get();

        // Set token and expiry (30 minutes from now)
        emp.setResetToken(token);
        emp.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        employeeRepository.save(emp);

        // Construct frontend reset password link (HashRouter-friendly)
        String resetLink = "http://localhost:5173/#/employee/reset-password/" + token;
        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        String expiryTime = LocalDateTime.now().plusMinutes(30).format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(emp.getEmail());
            helper.setSubject("InsurAI - Password Reset Request");

            String content = "<!DOCTYPE html>" +
                    "<html lang='en'>" +
                    "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<title>Password Reset - InsurAI</title>" +
                    "</head>" +
                    "<body style='margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f7fa; line-height: 1.6;'>" +
                    "<table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f7fa; padding: 20px 0;'>" +
                    "<tr><td align='center'>" +
                    "<table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;'>" +

                    // Header
                    "<tr>" +
                    "<td style='background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); padding: 30px 40px; text-align: center;'>" +
                    "<h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>InsurAI</h1>" +
                    "<p style='margin: 5px 0 0 0; color: #e3f2fd; font-size: 14px;'>Corporate Policy Automation & Intelligence</p>" +
                    "</td>" +
                    "</tr>" +

                    // Main Content
                    "<tr>" +
                    "<td style='padding: 40px;'>" +
                    "<h2 style='color: #1a73e8; margin: 0 0 20px 0; font-size: 22px;'>Password Reset Request</h2>" +
                    "<p style='color: #333333; margin: 0 0 15px 0;'>Dear <strong>" + emp.getName() + "</strong>,</p>" +
                    "<p style='color: #555555; margin: 0 0 20px 0;'>We received a request to reset the password for your InsurAI account associated with this email address. If you made this request, please click the button below to reset your password.</p>" +

                    // Reset Button
                    "<table width='100%' cellpadding='0' cellspacing='0' style='margin: 30px 0;'>" +
                    "<tr><td align='center'>" +
                    "<a href='" + resetLink + "' style='display: inline-block; background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;'>Reset Password</a>" +
                    "</td></tr>" +
                    "</table>" +

                    // Security Notice Box
                    "<div style='background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 0 4px 4px 0;'>" +
                    "<p style='margin: 0; color: #856404; font-weight: bold;'>⚠️ Security Notice</p>" +
                    "<p style='margin: 5px 0 0 0; color: #856404; font-size: 14px;'>This link will expire in <strong>30 minutes</strong> for your security. If you did not request a password reset, please ignore this email or contact our support team immediately.</p>" +
                    "</div>" +

                    // Request Details
                    "<div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
                    "<h3 style='margin: 0 0 15px 0; color: #333333; font-size: 16px;'>Request Details:</h3>" +
                    "<table width='100%' cellpadding='5' cellspacing='0' style='font-size: 14px;'>" +
                    "<tr><td style='color: #666666; width: 150px;'>Email Address:</td><td style='color: #333333;'><strong>" + emp.getEmail() + "</strong></td></tr>" +
                    "<tr><td style='color: #666666;'>Employee ID:</td><td style='color: #333333;'><strong>" + emp.getEmployeeId() + "</strong></td></tr>" +
                    "<tr><td style='color: #666666;'>Request Time:</td><td style='color: #333333;'><strong>" + currentDateTime + "</strong></td></tr>" +
                    "<tr><td style='color: #666666;'>Link Expires:</td><td style='color: #333333;'><strong>" + expiryTime + "</strong></td></tr>" +
                    "</table>" +
                    "</div>" +

                    // Alternative Link
                    "<p style='color: #666666; font-size: 13px; margin: 20px 0 0 0;'>If the button above doesn't work, copy and paste the following link into your browser:</p>" +
                    "<p style='background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #1a73e8;'>" + resetLink + "</p>" +
                    "</td>" +
                    "</tr>" +

                    // Footer
                    "<tr>" +
                    "<td style='background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #e0e0e0;'>" +
                    "<table width='100%' cellpadding='0' cellspacing='0'>" +
                    "<tr>" +
                    "<td style='text-align: center;'>" +
                    "<p style='margin: 0 0 10px 0; color: #666666; font-size: 14px;'>Need help? Contact our support team</p>" +
                    "<p style='margin: 0 0 15px 0; color: #1a73e8; font-size: 14px;'>support@insurai.com | +1 (800) 123-4567</p>" +
                    "<hr style='border: none; border-top: 1px solid #e0e0e0; margin: 15px 0;'>" +
                    "<p style='margin: 0; color: #999999; font-size: 12px;'>© 2025 InsurAI. All rights reserved.</p>" +
                    "<p style='margin: 5px 0 0 0; color: #999999; font-size: 11px;'>This is an automated message. Please do not reply directly to this email.</p>" +
                    "</td>" +
                    "</tr>" +
                    "</table>" +
                    "</td>" +
                    "</tr>" +

                    "</table>" +
                    "</td></tr>" +
                    "</table>" +
                    "</body>" +
                    "</html>";

            helper.setText(content, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Password reset email sent to: " + email);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send password reset email to " + email + ": " + e.getMessage());
        }
    }
}
