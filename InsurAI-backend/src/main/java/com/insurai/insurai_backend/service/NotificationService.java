package com.insurai.insurai_backend.service;

import java.time.format.DateTimeFormatter;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.insurai.insurai_backend.model.Claim;
import com.insurai.insurai_backend.model.EmployeeQuery;
import com.insurai.insurai_backend.model.Hr;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class NotificationService {

    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 🔹 Common Date Format (12-hour format with AM/PM)
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // 🔹 Professional Email Template Components
    private static final String EMAIL_BASE_STYLE =
        "<style>" +
        "body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fa; line-height: 1.6; }" +
        ".email-wrapper { background-color: #f4f7fa; padding: 20px 0; }" +
        ".email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }" +
        ".email-header { background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); padding: 30px 40px; text-align: center; }" +
        ".email-header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px; }" +
        ".email-header .tagline { margin: 8px 0 0 0; color: #e3f2fd; font-size: 13px; }" +
        ".email-header .notification-type { margin: 15px 0 0 0; display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; }" +
        ".email-content { padding: 35px 40px; }" +
        ".greeting { color: #333333; font-size: 16px; margin: 0 0 15px 0; }" +
        ".main-message { color: #555555; font-size: 15px; margin: 0 0 25px 0; }" +
        ".status-badge { display: inline-block; padding: 6px 15px; border-radius: 15px; font-weight: 600; font-size: 14px; text-transform: uppercase; }" +
        ".status-approved { background-color: #d4edda; color: #155724; }" +
        ".status-rejected { background-color: #f8d7da; color: #721c24; }" +
        ".status-pending { background-color: #fff3cd; color: #856404; }" +
        ".status-processing { background-color: #cce5ff; color: #004085; }" +
        ".details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #fafafa; border-radius: 8px; overflow: hidden; }" +
        ".details-table th, .details-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e8e8e8; }" +
        ".details-table th { background-color: #f0f4f8; color: #4a5568; font-weight: 600; width: 40%; font-size: 14px; }" +
        ".details-table td { color: #2d3748; font-size: 14px; }" +
        ".info-box { background-color: #e8f4fd; border-left: 4px solid #1a73e8; padding: 15px 20px; margin: 20px 0; border-radius: 0 5px 5px 0; }" +
        ".info-box p { margin: 0; color: #1a73e8; font-size: 14px; }" +
        ".warning-box { background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 0 5px 5px 0; }" +
        ".warning-box p { margin: 0; color: #856404; font-size: 14px; }" +
        ".success-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px 20px; margin: 20px 0; border-radius: 0 5px 5px 0; }" +
        ".success-box p { margin: 0; color: #155724; font-size: 14px; }" +
        ".cta-button { display: inline-block; background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 14px; margin: 15px 0; }" +
        ".email-footer { background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #e8e8e8; text-align: center; }" +
        ".footer-contact { margin: 0 0 15px 0; color: #666666; font-size: 13px; }" +
        ".footer-contact a { color: #1a73e8; text-decoration: none; }" +
        ".footer-divider { border: none; border-top: 1px solid #e0e0e0; margin: 15px 0; }" +
        ".footer-copyright { margin: 0; color: #999999; font-size: 12px; }" +
        ".footer-disclaimer { margin: 8px 0 0 0; color: #aaaaaa; font-size: 11px; }" +
        "</style>";

    private String buildEmailHeader(String notificationType, String headerColor) {
        return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>" + notificationType + " - InsurAI</title>" +
                EMAIL_BASE_STYLE +
                "</head>" +
                "<body>" +
                "<div class='email-wrapper'>" +
                "<div class='email-container'>" +
                "<div class='email-header' style='background: linear-gradient(135deg, " + headerColor + " 0%, " + darkenColor(headerColor) + " 100%);'>" +
                "<h1>InsurAI</h1>" +
                "<p class='tagline'>Corporate Policy Automation & Intelligence</p>" +
                "<span class='notification-type'>" + notificationType + "</span>" +
                "</div>";
    }

    private String buildEmailFooter() {
        return "<div class='email-footer'>" +
                "<p class='footer-contact'>Need assistance? Contact us at <a href='mailto:support@insurai.com'>support@insurai.com</a> | +1 (800) 123-4567</p>" +
                "<hr class='footer-divider'>" +
                "<p class='footer-copyright'>© 2025 InsurAI. All rights reserved.</p>" +
                "<p class='footer-disclaimer'>This is an automated message from InsurAI notification system. Please do not reply directly to this email.</p>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String darkenColor(String hexColor) {
        // Simple darkening for gradient effect
        if (hexColor.equals("#28a745")) return "#1e7e34";
        if (hexColor.equals("#dc3545")) return "#bd2130";
        if (hexColor.equals("#0d6efd")) return "#0a58ca";
        if (hexColor.equals("#198754")) return "#146c43";
        if (hexColor.equals("#ff8800")) return "#e67e00";
        if (hexColor.equals("#007bff")) return "#0056b3";
        if (hexColor.equals("#17a2b8")) return "#117a8b";
        if (hexColor.equals("#ffc107")) return "#d39e00";
        return "#0d47a1";
    }

    private String getStatusBadgeClass(String status) {
        if (status == null) return "status-pending";
        switch (status.toLowerCase()) {
            case "approved":
            case "completed":
            case "active":
                return "status-approved";
            case "rejected":
            case "denied":
            case "expired":
                return "status-rejected";
            case "processing":
            case "in_progress":
                return "status-processing";
            default:
                return "status-pending";
        }
    }

    
    // ========================= Claim Notifications =========================

    public void sendClaimStatusEmail(String to, Claim claim) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("InsurAI - Claim #" + claim.getId() + " Status Update: " + claim.getStatus());

            String statusColor = "Approved".equalsIgnoreCase(claim.getStatus()) ? "#28a745" : "#dc3545";
            String claimDateStr = claim.getClaimDate() != null ? claim.getClaimDate().format(FORMATTER) : "N/A";
            String hrName = (claim.getAssignedHr() != null && claim.getAssignedHr().getName() != null)
                    ? claim.getAssignedHr().getName() : "Not yet assigned";
            String employeeName = (claim.getEmployee() != null && claim.getEmployee().getName() != null)
                    ? claim.getEmployee().getName() : "Valued Employee";
            String statusBadgeClass = getStatusBadgeClass(claim.getStatus());

            String content = buildEmailHeader("Claim Status Update", statusColor) +
                    "<div class='email-content'>" +
                    "<p class='greeting'>Dear <strong>" + employeeName + "</strong>,</p>" +
                    "<p class='main-message'>We are writing to inform you about the status of your insurance claim. Your claim has been reviewed by our team and the current status is shown below.</p>" +

                    // Status Highlight Box
                    "<div style='text-align: center; margin: 25px 0;'>" +
                    "<p style='margin: 0 0 10px 0; color: #666666; font-size: 14px;'>Current Claim Status</p>" +
                    "<span class='status-badge " + statusBadgeClass + "'>" + claim.getStatus() + "</span>" +
                    "</div>" +

                    // Claim Details Table
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>📋 Claim Details</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Claim ID</th><td><strong>#" + claim.getId() + "</strong></td></tr>" +
                    "<tr><th>Claim Type</th><td>" + claim.getTitle() + "</td></tr>" +
                    "<tr><th>Policy</th><td>" + (claim.getPolicy() != null ? claim.getPolicy().getPolicyName() : "N/A") + "</td></tr>" +
                    "<tr><th>Claim Amount</th><td><strong style='color: #1a73e8;'>₹" + String.format("%,.2f", claim.getAmount()) + "</strong></td></tr>" +
                    "<tr><th>Submission Date</th><td>" + claimDateStr + "</td></tr>" +
                    "<tr><th>Assigned HR</th><td>" + hrName + "</td></tr>";

            if (claim.getRemarks() != null && !claim.getRemarks().isEmpty()) {
                content += "<tr><th>HR Remarks</th><td style='font-style: italic; color: #555555;'>\"" + claim.getRemarks() + "\"</td></tr>";
            }

            content += "</table>";

            // Status-specific message box
            if ("Approved".equalsIgnoreCase(claim.getStatus())) {
                content += "<div class='success-box'>" +
                        "<p><strong>✅ Congratulations!</strong> Your claim has been approved. The reimbursement will be processed as per the company policy timeline. You will receive a separate notification once the payment is initiated.</p>" +
                        "</div>";
            } else if ("Rejected".equalsIgnoreCase(claim.getStatus())) {
                content += "<div class='warning-box'>" +
                        "<p><strong>ℹ️ Claim Not Approved:</strong> Unfortunately, your claim could not be approved at this time. Please review the remarks above for details. If you believe this is an error or have additional documentation, please contact HR for further assistance.</p>" +
                        "</div>";
            }

            content += "<div class='info-box'>" +
                    "<p>📌 <strong>Next Steps:</strong> Log in to your <a href='http://localhost:5173/#/employee/dashboard' style='color: #1a73e8; text-decoration: none;'>InsurAI Employee Dashboard</a> to view complete details and track your claim status.</p>" +
                    "</div>" +
                    "</div>" +
                    buildEmailFooter();

            helper.setText(content, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Claim status email sent to Employee: " + to + " (Claim #" + claim.getId() + ")");
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send claim status email (Claim #" + claim.getId() + "): " + e.getMessage());
        }
    }

    public void sendNewClaimAssignedToHr(String to, Hr hr, Claim claim) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("InsurAI - New Claim Assignment #" + claim.getId() + " - Action Required");

            String claimDateStr = claim.getClaimDate() != null ? claim.getClaimDate().format(FORMATTER) : "N/A";
            String hrName = (hr != null && hr.getName() != null) ? hr.getName() : "HR Manager";
            String employeeName = (claim.getEmployee() != null && claim.getEmployee().getName() != null)
                    ? claim.getEmployee().getName() : "N/A";
            String employeeId = (claim.getEmployee() != null && claim.getEmployee().getEmployeeId() != null)
                    ? claim.getEmployee().getEmployeeId() : "N/A";

            String content = buildEmailHeader("New Claim Assignment", "#198754") +
                    "<div class='email-content'>" +
                    "<p class='greeting'>Dear <strong>" + hrName + "</strong>,</p>" +
                    "<p class='main-message'>A new insurance claim has been submitted and assigned to you for review. Please review the claim details below and take appropriate action at your earliest convenience.</p>" +

                    // Priority Notice
                    "<div class='warning-box'>" +
                    "<p><strong>⏰ Action Required:</strong> This claim is awaiting your review. Please process this request within the standard turnaround time to ensure timely resolution for the employee.</p>" +
                    "</div>" +

                    // Claim Details
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>📋 Claim Information</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Claim ID</th><td><strong style='color: #1a73e8;'>#" + claim.getId() + "</strong></td></tr>" +
                    "<tr><th>Claim Type</th><td>" + claim.getTitle() + "</td></tr>" +
                    "<tr><th>Claim Amount</th><td><strong style='color: #dc3545;'>₹" + String.format("%,.2f", claim.getAmount()) + "</strong></td></tr>" +
                    "<tr><th>Submission Date</th><td>" + claimDateStr + "</td></tr>" +
                    "</table>" +

                    // Employee Details
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>👤 Employee Information</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Employee Name</th><td>" + employeeName + "</td></tr>" +
                    "<tr><th>Employee ID</th><td>" + employeeId + "</td></tr>" +
                    "<tr><th>Email</th><td>" + (claim.getEmployee() != null ? claim.getEmployee().getEmail() : "N/A") + "</td></tr>" +
                    "</table>" +

                    // Action Button
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:5173/#/hr/dashboard' class='cta-button'>Review Claim in Dashboard</a>" +
                    "</div>" +

                    "<div class='info-box'>" +
                    "<p>📌 <strong>Quick Actions:</strong> Log in to your HR Dashboard to approve, reject, or request additional documentation for this claim.</p>" +
                    "</div>" +
                    "</div>" +
                    buildEmailFooter();

            helper.setText(content, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ New claim assignment email sent to HR: " + to + " (Claim #" + claim.getId() + ")");
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send HR new claim notification (Claim #" + claim.getId() + "): " + e.getMessage());
        }
    }

    // ========================= Employee-Agent Query Notifications =========================

    public void sendEmployeeQueryNotificationToAgent(String to, EmployeeQuery query) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("InsurAI - New Employee Query #" + query.getId() + " - Response Required");

            String employeeName = (query.getEmployee() != null && query.getEmployee().getName() != null)
                    ? query.getEmployee().getName() : "Employee";
            String employeeId = (query.getEmployee() != null && query.getEmployee().getEmployeeId() != null)
                    ? query.getEmployee().getEmployeeId() : "N/A";

            String content = buildEmailHeader("New Query Received", "#ff8800") +
                    "<div class='email-content'>" +
                    "<p class='greeting'>Dear <strong>Insurance Agent</strong>,</p>" +
                    "<p class='main-message'>A new query has been submitted by an employee and requires your expert assistance. Please review the details below and provide a helpful response.</p>" +

                    // Priority Notice
                    "<div class='warning-box'>" +
                    "<p><strong>📨 Response Required:</strong> The employee is awaiting your response. Please address this query promptly to maintain excellent customer service standards.</p>" +
                    "</div>" +

                    // Query Details
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>❓ Query Details</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Query ID</th><td><strong style='color: #1a73e8;'>#" + query.getId() + "</strong></td></tr>" +
                    "<tr><th>Policy Name</th><td>" + (query.getPolicyName() != null ? query.getPolicyName() : "General Query") + "</td></tr>" +
                    "<tr><th>Claim Type</th><td>" + (query.getClaimType() != null ? query.getClaimType() : "N/A") + "</td></tr>" +
                    "</table>" +

                    // Query Text Box
                    "<div style='background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ff8800;'>" +
                    "<p style='margin: 0 0 10px 0; color: #666666; font-size: 12px; text-transform: uppercase; font-weight: 600;'>Employee's Question</p>" +
                    "<p style='margin: 0; color: #333333; font-size: 15px; font-style: italic;'>\"" + query.getQueryText() + "\"</p>" +
                    "</div>" +

                    // Employee Info
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>👤 Submitted By</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Employee Name</th><td>" + employeeName + "</td></tr>" +
                    "<tr><th>Employee ID</th><td>" + employeeId + "</td></tr>" +
                    "</table>" +

                    // Action Button
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:5173/#/agent/dashboard' class='cta-button'>Respond to Query</a>" +
                    "</div>" +

                    "<div class='info-box'>" +
                    "<p>📌 <strong>Tip:</strong> Providing clear, detailed, and friendly responses helps build trust with employees and improves satisfaction scores.</p>" +
                    "</div>" +
                    "</div>" +
                    buildEmailFooter();

            helper.setText(content, true);
            mailSender.send(mimeMessage);

            System.out.println("✅ New query notification sent to Agent: " + to + " (Query #" + query.getId() + ")");
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send new query notification to agent (Query #" + query.getId() + "): " + e.getMessage());
        }
    }

    // 🔹 Agent response notification to Employee
    public void sendAgentResponseNotificationToEmployee(String to, EmployeeQuery query) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("InsurAI - Your Query #" + query.getId() + " Has Been Answered");

            String employeeName = (query.getEmployee() != null && query.getEmployee().getName() != null)
                    ? query.getEmployee().getName() : "Valued Employee";

            String content = buildEmailHeader("Query Response", "#007bff") +
                    "<div class='email-content'>" +
                    "<p class='greeting'>Dear <strong>" + employeeName + "</strong>,</p>" +
                    "<p class='main-message'>Great news! Our insurance agent has reviewed and responded to your query. Please find the details below.</p>" +

                    // Success Notice
                    "<div class='success-box'>" +
                    "<p><strong>✅ Query Resolved:</strong> Your question has been answered by our expert insurance agent.</p>" +
                    "</div>" +

                    // Query Details
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>❓ Your Original Query</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Query ID</th><td><strong style='color: #1a73e8;'>#" + query.getId() + "</strong></td></tr>" +
                    "<tr><th>Policy Name</th><td>" + (query.getPolicyName() != null ? query.getPolicyName() : "General Query") + "</td></tr>" +
                    "<tr><th>Claim Type</th><td>" + (query.getClaimType() != null ? query.getClaimType() : "N/A") + "</td></tr>" +
                    "</table>" +

                    // Original Question Box
                    "<div style='background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6c757d;'>" +
                    "<p style='margin: 0 0 10px 0; color: #666666; font-size: 12px; text-transform: uppercase; font-weight: 600;'>Your Question</p>" +
                    "<p style='margin: 0; color: #333333; font-size: 15px; font-style: italic;'>\"" + query.getQueryText() + "\"</p>" +
                    "</div>" +

                    // Agent Response Box
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>💬 Agent's Response</h3>" +
                    "<div style='background-color: #e8f4fd; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1a73e8;'>" +
                    "<p style='margin: 0; color: #333333; font-size: 15px;'>" + (query.getResponse() != null ? query.getResponse() : "Response pending") + "</p>" +
                    "</div>" +

                    // Action Button
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:5173/#/employee/dashboard' class='cta-button'>View in Dashboard</a>" +
                    "</div>" +

                    "<div class='info-box'>" +
                    "<p>📌 <strong>Need more help?</strong> If you have follow-up questions or need further clarification, feel free to submit a new query through your Employee Dashboard.</p>" +
                    "</div>" +
                    "</div>" +
                    buildEmailFooter();

            helper.setText(content, true);
            mailSender.send(mimeMessage);

            System.out.println("✅ Agent response notification sent to Employee: " + to + " (Query #" + query.getId() + ")");
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send agent response notification to employee (Query #" + query.getId() + "): " + e.getMessage());
        }
    }

    // ========================= Enrollment Notifications =========================

    public void sendEnrollmentApprovalEmail(String to, String employeeName, String policyName, java.time.LocalDate effectiveDate) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("InsurAI - Policy Enrollment Approved: " + policyName);

            String formattedDate = effectiveDate != null ? effectiveDate.format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy")) : "N/A";

            String content = buildEmailHeader("Enrollment Approved", "#28a745") +
                    "<div class='email-content'>" +
                    "<p class='greeting'>Dear <strong>" + (employeeName != null ? employeeName : "Valued Employee") + "</strong>,</p>" +
                    "<p class='main-message'>We are pleased to inform you that your policy enrollment request has been approved! You are now covered under the selected insurance policy.</p>" +

                    // Celebration Box
                    "<div class='success-box' style='text-align: center;'>" +
                    "<p style='font-size: 18px; margin: 0;'><strong>🎉 Congratulations!</strong></p>" +
                    "<p style='margin: 10px 0 0 0;'>Your enrollment has been successfully approved.</p>" +
                    "</div>" +

                    // Enrollment Details
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>📋 Enrollment Details</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Policy Name</th><td><strong style='color: #1a73e8;'>" + policyName + "</strong></td></tr>" +
                    "<tr><th>Coverage Status</th><td><span class='status-badge status-approved'>Active</span></td></tr>" +
                    "<tr><th>Effective Date</th><td><strong>" + formattedDate + "</strong></td></tr>" +
                    "</table>" +

                    // What's Next Box
                    "<div style='background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>" +
                    "<h4 style='margin: 0 0 15px 0; color: #333333;'>📌 What's Next?</h4>" +
                    "<ul style='margin: 0; padding-left: 20px; color: #555555;'>" +
                    "<li style='margin-bottom: 8px;'>Your coverage is now active as of the effective date mentioned above</li>" +
                    "<li style='margin-bottom: 8px;'>You can view your policy details and coverage information in your dashboard</li>" +
                    "<li style='margin-bottom: 8px;'>Keep your policy documents safe for future reference</li>" +
                    "<li>In case of any claims, you can submit them through the Employee Dashboard</li>" +
                    "</ul>" +
                    "</div>" +

                    // Action Button
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:5173/#/employee/dashboard' class='cta-button'>View Policy Details</a>" +
                    "</div>" +

                    "<div class='info-box'>" +
                    "<p>📞 <strong>Questions?</strong> If you have any questions about your coverage or need assistance, please contact HR or submit a query through your dashboard.</p>" +
                    "</div>" +
                    "</div>" +
                    buildEmailFooter();

            helper.setText(content, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Enrollment approval email sent to: " + to);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send enrollment approval email: " + e.getMessage());
        }
    }

    // ========================= Reimbursement Notifications =========================

    public void sendReimbursementStatusEmail(String to, String employeeName, Long claimId, String status, Double amount) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("InsurAI - Reimbursement " + status + " for Claim #" + claimId);

            String statusColor = "Completed".equalsIgnoreCase(status) ? "#28a745" : "#0d6efd";
            String statusBadgeClass = getStatusBadgeClass(status);
            String formattedAmount = String.format("%,.2f", amount);

            String content = buildEmailHeader("Reimbursement Update", statusColor) +
                    "<div class='email-content'>" +
                    "<p class='greeting'>Dear <strong>" + (employeeName != null ? employeeName : "Valued Employee") + "</strong>,</p>" +
                    "<p class='main-message'>We are writing to update you on the status of your claim reimbursement. Please find the details below.</p>" +

                    // Status Highlight
                    "<div style='text-align: center; margin: 25px 0;'>" +
                    "<p style='margin: 0 0 10px 0; color: #666666; font-size: 14px;'>Reimbursement Status</p>" +
                    "<span class='status-badge " + statusBadgeClass + "'>" + status + "</span>" +
                    "</div>" +

                    // Reimbursement Details
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>💰 Reimbursement Details</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Claim ID</th><td><strong style='color: #1a73e8;'>#" + claimId + "</strong></td></tr>" +
                    "<tr><th>Reimbursement Amount</th><td><strong style='color: #28a745; font-size: 18px;'>₹" + formattedAmount + "</strong></td></tr>" +
                    "<tr><th>Current Status</th><td><span class='status-badge " + statusBadgeClass + "'>" + status + "</span></td></tr>" +
                    "</table>";

            // Status-specific message
            if ("Completed".equalsIgnoreCase(status)) {
                content += "<div class='success-box'>" +
                        "<p><strong>✅ Payment Processed!</strong> Your reimbursement has been successfully processed. The amount will be credited to your registered bank account within 3-5 business days.</p>" +
                        "</div>";
            } else if ("Processing".equalsIgnoreCase(status)) {
                content += "<div class='info-box'>" +
                        "<p><strong>⏳ In Progress:</strong> Your reimbursement is currently being processed by our finance team. You will receive another notification once the payment is completed.</p>" +
                        "</div>";
            } else if ("Pending".equalsIgnoreCase(status)) {
                content += "<div class='warning-box'>" +
                        "<p><strong>📋 Pending Review:</strong> Your reimbursement request is in the queue for processing. Our team will review it shortly.</p>" +
                        "</div>";
            }

            content += "<div style='background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>" +
                    "<h4 style='margin: 0 0 15px 0; color: #333333;'>📌 Payment Information</h4>" +
                    "<p style='margin: 0; color: #555555; font-size: 14px;'>Reimbursements are typically processed within 3-5 business days after approval. The payment will be made to your registered bank account on file.</p>" +
                    "</div>" +

                    // Action Button
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:5173/#/employee/dashboard' class='cta-button'>Track Reimbursement</a>" +
                    "</div>" +
                    "</div>" +
                    buildEmailFooter();

            helper.setText(content, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Reimbursement status email sent to: " + to);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send reimbursement status email: " + e.getMessage());
        }
    }

    // ========================= Renewal Notifications =========================

    public void sendRenewalAlertEmail(String to, String employeeName, String policyName,
                                      java.time.LocalDate renewalDate, int daysRemaining) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            String urgencyPrefix = daysRemaining <= 7 ? "⚠️ URGENT: " : (daysRemaining <= 15 ? "📢 Important: " : "");
            helper.setSubject(urgencyPrefix + "InsurAI - Policy Renewal Alert: " + policyName);

            String headerColor = daysRemaining <= 7 ? "#dc3545" : (daysRemaining <= 15 ? "#ffc107" : "#17a2b8");
            String formattedDate = renewalDate != null ? renewalDate.format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy")) : "N/A";
            String urgencyLevel = daysRemaining <= 7 ? "Critical" : (daysRemaining <= 15 ? "High" : "Normal");
            String urgencyBadgeClass = daysRemaining <= 7 ? "status-rejected" : (daysRemaining <= 15 ? "status-pending" : "status-processing");

            String content = buildEmailHeader("Policy Renewal Alert", headerColor) +
                    "<div class='email-content'>" +
                    "<p class='greeting'>Dear <strong>" + (employeeName != null ? employeeName : "Valued Employee") + "</strong>,</p>" +
                    "<p class='main-message'>This is a friendly reminder that your insurance policy is approaching its renewal date. Please take action to ensure continuous coverage.</p>" +

                    // Urgency Banner
                    "<div style='background-color: " + (daysRemaining <= 7 ? "#f8d7da" : (daysRemaining <= 15 ? "#fff3cd" : "#d1ecf1")) + "; " +
                    "border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;'>" +
                    "<p style='margin: 0; font-size: 36px; font-weight: bold; color: " + (daysRemaining <= 7 ? "#721c24" : (daysRemaining <= 15 ? "#856404" : "#0c5460")) + ";'>" + daysRemaining + "</p>" +
                    "<p style='margin: 5px 0 0 0; color: " + (daysRemaining <= 7 ? "#721c24" : (daysRemaining <= 15 ? "#856404" : "#0c5460")) + "; font-size: 14px; text-transform: uppercase;'>Days Until Expiry</p>" +
                    "</div>" +

                    // Policy Details
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>📋 Policy Details</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Policy Name</th><td><strong style='color: #1a73e8;'>" + policyName + "</strong></td></tr>" +
                    "<tr><th>Renewal Date</th><td><strong style='color: #dc3545;'>" + formattedDate + "</strong></td></tr>" +
                    "<tr><th>Days Remaining</th><td><strong>" + daysRemaining + " days</strong></td></tr>" +
                    "<tr><th>Urgency Level</th><td><span class='status-badge " + urgencyBadgeClass + "'>" + urgencyLevel + "</span></td></tr>" +
                    "</table>";

            // Urgency-specific message
            if (daysRemaining <= 7) {
                content += "<div class='warning-box' style='background-color: #f8d7da; border-left-color: #dc3545;'>" +
                        "<p style='color: #721c24;'><strong>⚠️ Immediate Action Required!</strong> Your policy expires in less than a week. To avoid any gap in coverage, please initiate the renewal process immediately by contacting HR.</p>" +
                        "</div>";
            } else if (daysRemaining <= 15) {
                content += "<div class='warning-box'>" +
                        "<p><strong>📢 Action Recommended:</strong> Your policy renewal date is approaching. We recommend initiating the renewal process soon to ensure uninterrupted coverage.</p>" +
                        "</div>";
            } else {
                content += "<div class='info-box'>" +
                        "<p><strong>ℹ️ Advance Notice:</strong> This is an early reminder about your upcoming policy renewal. You have sufficient time to plan and complete the renewal process.</p>" +
                        "</div>";
            }

            content += "<div style='background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>" +
                    "<h4 style='margin: 0 0 15px 0; color: #333333;'>📌 How to Renew Your Policy</h4>" +
                    "<ol style='margin: 0; padding-left: 20px; color: #555555;'>" +
                    "<li style='margin-bottom: 8px;'>Contact your HR department or policy administrator</li>" +
                    "<li style='margin-bottom: 8px;'>Review your current coverage and any updates to the policy</li>" +
                    "<li style='margin-bottom: 8px;'>Complete any required documentation for renewal</li>" +
                    "<li>Confirm renewal before the expiry date to avoid coverage gaps</li>" +
                    "</ol>" +
                    "</div>" +

                    // Action Button
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:5173/#/employee/dashboard' class='cta-button'>View Policy Details</a>" +
                    "</div>" +
                    "</div>" +
                    buildEmailFooter();

            helper.setText(content, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Renewal alert email sent to: " + to);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send renewal alert email: " + e.getMessage());
        }
    }

    public void sendPolicyStatusEmail(String to, String employeeName, String policyName, String status) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("InsurAI - Policy Status Update: " + policyName + " - " + status);

            String statusColor = "Active".equalsIgnoreCase(status) ? "#28a745" : "#dc3545";
            String statusBadgeClass = getStatusBadgeClass(status);
            String currentDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy"));

            String content = buildEmailHeader("Policy Status Update", statusColor) +
                    "<div class='email-content'>" +
                    "<p class='greeting'>Dear <strong>" + (employeeName != null ? employeeName : "Valued Employee") + "</strong>,</p>" +
                    "<p class='main-message'>We are writing to inform you about an important update regarding your insurance policy status.</p>" +

                    // Status Highlight
                    "<div style='text-align: center; margin: 25px 0;'>" +
                    "<p style='margin: 0 0 10px 0; color: #666666; font-size: 14px;'>Current Policy Status</p>" +
                    "<span class='status-badge " + statusBadgeClass + "' style='font-size: 16px; padding: 10px 25px;'>" + status + "</span>" +
                    "</div>" +

                    // Policy Details
                    "<h3 style='color: #333333; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px;'>📋 Policy Information</h3>" +
                    "<table class='details-table'>" +
                    "<tr><th>Policy Name</th><td><strong style='color: #1a73e8;'>" + policyName + "</strong></td></tr>" +
                    "<tr><th>Status</th><td><span class='status-badge " + statusBadgeClass + "'>" + status + "</span></td></tr>" +
                    "<tr><th>Status Update Date</th><td>" + currentDate + "</td></tr>" +
                    "</table>";

            // Status-specific messages
            if ("Active".equalsIgnoreCase(status)) {
                content += "<div class='success-box'>" +
                        "<p><strong>✅ Coverage Active!</strong> Your policy is now active and you are fully covered. You can submit claims and access all benefits associated with this policy.</p>" +
                        "</div>";
            } else if ("Expired".equalsIgnoreCase(status)) {
                content += "<div class='warning-box' style='background-color: #f8d7da; border-left-color: #dc3545;'>" +
                        "<p style='color: #721c24;'><strong>⚠️ Coverage Ended:</strong> Your policy has expired. You will no longer be able to submit claims under this policy. Please contact HR immediately to discuss renewal options and avoid any coverage gaps.</p>" +
                        "</div>";
            } else if ("Suspended".equalsIgnoreCase(status)) {
                content += "<div class='warning-box'>" +
                        "<p><strong>⏸️ Policy Suspended:</strong> Your policy has been temporarily suspended. Please contact HR for more information and to resolve any outstanding issues.</p>" +
                        "</div>";
            } else if ("Cancelled".equalsIgnoreCase(status)) {
                content += "<div class='warning-box' style='background-color: #f8d7da; border-left-color: #dc3545;'>" +
                        "<p style='color: #721c24;'><strong>❌ Policy Cancelled:</strong> Your policy has been cancelled. If you believe this is an error or need assistance, please contact HR immediately.</p>" +
                        "</div>";
            }

            content += "<div style='background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>" +
                    "<h4 style='margin: 0 0 15px 0; color: #333333;'>📌 Important Notes</h4>" +
                    "<ul style='margin: 0; padding-left: 20px; color: #555555;'>" +
                    "<li style='margin-bottom: 8px;'>Keep this email for your records</li>" +
                    "<li style='margin-bottom: 8px;'>Review your policy documents for complete coverage details</li>" +
                    "<li>Contact HR if you have any questions about your coverage</li>" +
                    "</ul>" +
                    "</div>" +

                    // Action Button
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:5173/#/employee/dashboard' class='cta-button'>View Policy Details</a>" +
                    "</div>" +

                    "<div class='info-box'>" +
                    "<p>📞 <strong>Need Assistance?</strong> If you have questions or concerns about this policy update, please don't hesitate to contact our HR team or submit a query through your dashboard.</p>" +
                    "</div>" +
                    "</div>" +
                    buildEmailFooter();

            helper.setText(content, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Policy status email sent to: " + to);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send policy status email: " + e.getMessage());
        }
    }
}
