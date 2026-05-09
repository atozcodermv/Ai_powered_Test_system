package ExamPortal.services;

import ExamPortal.utility.Constants.UserRole;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;
    private static final String PLATFORM_NAME = "Smart Exam Portal";

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendEmail(String to,String subject,String body) {

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body,true);
            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            e.getMessage();
            throw new RuntimeException(e);
        }

    }

    public void sendRegistrationSuccessEmail(String to, String fullName, String registeredEmail, String password, String role) {
        String safeName = fullName == null || fullName.isBlank() ? "User" : fullName.trim();
        String welcomeMessage = UserRole.ROLE_TEACHER.value().equalsIgnoreCase(role)
                ? "Welcome to our Smart Exam Portal! We are pleased to have you as part of our academic community. Your registration has been successfully completed, and your account is now active. Through this platform, you will be able to create and manage exams, monitor student performance, and contribute to a structured and efficient assessment process. Your role is essential in guiding students and maintaining the quality of the examination system. If you need any assistance while using the portal, our support team will be happy to help. We look forward to your valuable contribution and wish you a great experience using the platform."
                : "Welcome to our Smart Exam Portal! We are delighted to have you join our learning community. Your registration has been successfully completed, and your account is now ready to use. Through this platform, you will be able to participate in exams, track your progress, and enhance your knowledge in an organized and secure environment. We encourage you to explore the portal and make the most of the learning opportunities available. If you need any assistance, our support team is always here to help. We wish you the very best in your academic journey and upcoming examinations.";
        String body = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6;'>"
                + "<h2 style='margin-bottom:12px;'>Registration Completed Successfully</h2>"
                + "<p>Dear " + safeName + ",</p>"
                + "<p>" + welcomeMessage + "</p>"
                + "<p>You can now log in and start using the system.</p>"
                + "<div style='background:#f6f8fa;border:1px solid #d0d7de;border-radius:8px;padding:16px;margin:20px 0;'>"
                + "<p style='margin:0 0 8px 0;'><strong>Registered Email:</strong> " + registeredEmail + "</p>"
                + "<p style='margin:0;'><strong>Password:</strong> " + password + "</p>"
                + "</div>"
                + "<p>If you did not create this account, please contact support immediately.</p>"
                + "<p>Best regards,<br/>" + PLATFORM_NAME + " Team</p>"
                + "</div>";

        sendEmail(to, "Welcome to " + PLATFORM_NAME, body);
    }

    public void sendExamScheduledEmail(
            String to,
            String studentName,
            String courseName,
            String gradeName,
            String examDateTime,
            String durationInMinutes,
            String description,
            String topic,
            String examType
    ) {
        String safeName = studentName == null || studentName.isBlank() ? "Student" : studentName.trim();
        String body = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6;'>"
                + "<h2 style='margin-bottom:12px;'>New Exam Scheduled</h2>"
                + "<p>Dear " + safeName + ",</p>"
                + "<p>We would like to inform you that a new exam has been scheduled by your teacher for your course. Please find the exam details below:</p>"
                + "<div style='background:#f6f8fa;border:1px solid #d0d7de;border-radius:8px;padding:16px;margin:20px 0;'>"
                + "<p style='margin:0 0 8px 0;'><strong>Course:</strong> " + courseName + "</p>"
                + "<p style='margin:0 0 8px 0;'><strong>Grade:</strong> " + gradeName + "</p>"
                + "<p style='margin:0 0 8px 0;'><strong>Exam Date and Time:</strong> " + examDateTime + "</p>"
                + "<p style='margin:0 0 8px 0;'><strong>Duration in Mins:</strong> " + durationInMinutes + "</p>"
                + "<p style='margin:0 0 8px 0;'><strong>Description:</strong> " + description + "</p>"
                + "<p style='margin:0 0 8px 0;'><strong>Topic:</strong> " + topic + "</p>"
                + "<p style='margin:0;'><strong>Exam Type / Exam Difficulty:</strong> " + examType + "</p>"
                + "</div>"
                + "<p>Kindly ensure that you log in to the exam portal at the scheduled time to participate in the exam.</p>"
                + "<p>We encourage you to prepare well and wish you the best of luck. If you have any questions, please contact your teacher or the support team.</p>"
                + "<p>Best regards,<br/>" + PLATFORM_NAME + " Team</p>"
                + "</div>";

        sendEmail(to, "New Exam Scheduled - " + courseName, body);
    }

    public void sendTeacherGradeAssignmentEmail(
            String to,
            String teacherName,
            String gradeName,
            String gradeDescription
    ) {
        String safeName = teacherName == null || teacherName.isBlank() ? "Teacher" : teacherName.trim();
        String safeGradeName = gradeName == null || gradeName.isBlank() ? "N/A" : gradeName.trim();
        String safeGradeDescription =
                gradeDescription == null || gradeDescription.isBlank() ? "the assigned curriculum and academic plan" : gradeDescription.trim();

        String body = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6;'>"
                + "<h2 style='margin-bottom:12px;'>Grade Assignment Confirmation</h2>"
                + "<p>Dear " + safeName + ",</p>"
                + "<p>You have been successfully assigned to teach a new grade in the system.</p>"
                + "<div style='background:#f6f8fa;border:1px solid #d0d7de;border-radius:8px;padding:16px;margin:20px 0;'>"
                + "<p style='margin:0 0 8px 0;'><strong>Grade Name:</strong> " + safeGradeName + "</p>"
                + "<p style='margin:0;'><strong>Grade Description:</strong> " + safeGradeDescription + "</p>"
                + "</div>"
                + "<p>This grade focuses on " + safeGradeDescription + ", and you will now be responsible for managing and teaching the students enrolled in this grade.</p>"
                + "<p>Please review the course materials and prepare accordingly to ensure effective learning for the students.</p>"
                + "<p>If you have any questions regarding the syllabus, schedule, or responsibilities related to this grade, please contact the administration.</p>"
                + "<p>We wish you success in guiding and supporting the students of this grade.</p>"
                + "<p>Best regards,<br/>Administration Team</p>"
                + "</div>";

        sendEmail(to, "New Grade Assignment - " + safeGradeName, body);
    }

    public void sendExamResultEmail(String to, String studentName, ExamPortal.entities.ExamResult result, String universityName) {
        String safeName = studentName == null || studentName.isBlank() ? "Student" : studentName.trim();
        String examName = result.getExam().getName();
        String gradeName = result.getExam().getGrade().getName();
        String courseName = result.getExam().getCourse().getName();
        String scoreStr = result.getScore() + " / " + result.getTotalMarks();
        String percentageStr = result.getPercentage() + "%";
        String status = result.getResultStatus();
        String statusColor = "green".equalsIgnoreCase(status) || "Pass".equalsIgnoreCase(status) ? "#28a745" : "#dc3545";

        // Logic check for result status color
        if("Pending".equalsIgnoreCase(result.getEvaluationStatus()) || "Pending".equalsIgnoreCase(status)) {
            statusColor = "#ffc107"; // Yellow for pending
        }

        String body = "<div style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>"
                + "  <div style='background-color: #004a99; color: #ffffff; padding: 20px; text-align: center;'>"
                + "    <h1 style='margin: 0; font-size: 24px;'>" + universityName + "</h1>"
                + "    <p style='margin: 5px 0 0 0; font-size: 16px;'>Exam Result Summary</p>"
                + "  </div>"
                + "  <div style='padding: 30px;'>"
                + "    <p style='font-size: 18px;'>Dear <strong>" + safeName + "</strong>,</p>"
                + "    <p>We are pleased to inform you that your result for the following exam has been processed.</p>"
                + "    <div style='background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>"
                + "      <table style='width: 100%; border-collapse: collapse;'>"
                + "        <tr><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Exam Name:</strong></td><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;'>" + examName + "</td></tr>"
                + "        <tr><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Course:</strong></td><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;'>" + courseName + "</td></tr>"
                + "        <tr><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Grade:</strong></td><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;'>" + gradeName + "</td></tr>"
                + "        <tr><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Total Score:</strong></td><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;'>" + scoreStr + "</td></tr>"
                + "        <tr><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Percentage:</strong></td><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;'>" + percentageStr + "</td></tr>"
                + "        <tr><td style='padding: 15px 0 8px 0;'><strong>Result Status:</strong></td><td style='padding: 15px 0 8px 0; text-align: right;'><span style='background-color: " + statusColor + "; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 14px;'>" + status + "</span></td></tr>"
                + "      </table>"
                + "    </div>"
                + "    <p style='margin-bottom: 30px;'>You can log in to the portal to view a detailed breakdown of your performance and question-wise evaluation.</p>"
                + "    <div style='text-align: center;'>"
                + "      <a href=\"http://localhost:3000/login\" style='background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Login to Portal</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>"
                + "    <p style='margin: 0;'>&copy; 2026 " + universityName + ". All rights reserved.</p>"
                + "    <p style='margin: 5px 0 0 0;'>This is an automated message, please do not reply.</p>"
                + "  </div>"
                + "</div>";

        sendEmail(to, "Exam Result: " + examName + " - " + status, body);
    }

    public void sendForgotPasswordOtpEmail(String to, String otp) {
        String body = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6;'>"
                + "<h2 style='margin-bottom:12px;'>Password Reset Request</h2>"
                + "<p>Hello,</p>"
                + "<p>We received a request to reset the password associated with this email address.</p>"
                + "<div style='background:#f6f8fa;border:1px solid #d0d7de;border-radius:8px;padding:16px;margin:20px 0;text-align:center;'>"
                + "<h3 style='margin:0;color:#004a99;letter-spacing:2px;'>" + otp + "</h3>"
                + "</div>"
                + "<p>This OTP is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>"
                + "<p>Best regards,<br/>" + PLATFORM_NAME + " Team</p>"
                + "</div>";

        sendEmail(to, "Password Reset OTP - " + PLATFORM_NAME, body);
    }

    public void sendLoginSecurityWarningEmail(String to) {
        String body = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>"
                + "  <div style='background-color: #ffc107; color: #ffffff; padding: 20px; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px; color: #333;'>Security Alert: Login Attempt Warning</h2>"
                + "  </div>"
                + "  <div style='padding: 30px;'>"
                + "    <p style='font-size: 16px;'>Hello,</p>"
                + "    <p>We noticed a login attempt on your Smart Exam account. You currently have only one login attempt remaining before your account may be temporarily locked. If this login attempt was made by you, you can safely ignore this message. However, if you do not recognize this activity, your account may be at risk. We strongly recommend resetting your password immediately to protect your account.</p>"
                + "    <div style='text-align: center; margin: 30px 0;'>"
                + "      <a href='http://localhost:3000/user/forgetpassword' style='background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;'>Reset Password</a>"
                + "    </div>"
                + "    <p>If you continue experiencing issues accessing your account, please contact the Smart Exam administration team for assistance.</p>"
                + "    <div style='background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 25px 0;'>"
                + "      <p style='margin: 0;'><strong>Admin Contact:</strong> Smartexam285@gmail.com</p>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>"
                + "    <p style='margin: 0;'>&copy; 2026 " + PLATFORM_NAME + ". All rights reserved.</p>"
                + "    <p style='margin: 5px 0 0 0;'>This is an automated message, please do not reply.</p>"
                + "  </div>"
                + "</div>";

        sendEmail(to, "Security Alert: Login Attempt Warning - " + PLATFORM_NAME, body);
    }

    
    public void sendCheatingNotificationEmail(
            String teacherEmail,
            String teacherName,
            String studentName,
            String studentId,
            String examTitle,
            String violationReason,
            String timestamp
    ) {
        String safeTeacherName = teacherName == null || teacherName.isBlank() ? "Teacher" : teacherName.trim();
        String safeStudentName = studentName == null || studentName.isBlank() ? "Unknown Student" : studentName.trim();

        String body = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>"
                + "  <div style='background-color: #dc3545; color: #ffffff; padding: 20px; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>Security Alert: Exam Violation Detected</h2>"
                + "  </div>"
                + "  <div style='padding: 30px;'>"
                + "    <p style='font-size: 16px;'>Dear " + safeTeacherName + ",</p>"
                + "    <p>This is an automated notification to inform you that a potential cheating violation has been detected during an active exam session.</p>"
                + "    <div style='background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 25px 0;'>"
                + "      <p style='margin: 0 0 8px 0;'><strong>Student Name:</strong> " + safeStudentName + "</p>"
                + "      <p style='margin: 0 0 8px 0;'><strong>Student ID:</strong> " + studentId + "</p>"
                + "      <p style='margin: 0 0 8px 0;'><strong>Exam Title:</strong> " + examTitle + "</p>"
                + "      <p style='margin: 0 0 8px 0; color: #dc3545;'><strong>Violation Reason:</strong> " + violationReason + "</p>"
                + "      <p style='margin: 0;'><strong>Time of Incident:</strong> " + timestamp + "</p>"
                + "    </div>"
                + "    <p>The student's exam has been automatically submitted to preserve the integrity of the assessment. Please review this incident at your earliest convenience in the admin portal.</p>"
                + "  </div>"
                + "  <div style='background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>"
                + "    <p style='margin: 0;'>&copy; 2026 " + PLATFORM_NAME + ". All rights reserved.</p>"
                + "    <p style='margin: 5px 0 0 0;'>This is a high-priority automated security alert.</p>"
                + "  </div>"
                + "</div>";

        sendEmail(teacherEmail, "URGENT: Exam Violation Detected - " + examTitle, body);
    }
}
