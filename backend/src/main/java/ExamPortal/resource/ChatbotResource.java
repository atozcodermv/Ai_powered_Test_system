package ExamPortal.resource;

import ExamPortal.dto.ChatbotRequestDto;
import ExamPortal.dto.ChatbotResponseDto;
import ExamPortal.entities.User;
import ExamPortal.services.StudentDoubtChatService;
import ExamPortal.services.UserService;
import ExamPortal.utility.Constants.ActiveStatus;
import ExamPortal.utility.Constants.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class ChatbotResource {

    private static final Logger LOG = LoggerFactory.getLogger(ChatbotResource.class);

    private final StudentDoubtChatService studentDoubtChatService;
    private final UserService userService;

    public ChatbotResource(StudentDoubtChatService studentDoubtChatService, UserService userService) {
        this.studentDoubtChatService = studentDoubtChatService;
        this.userService = userService;
    }

    public ResponseEntity<ChatbotResponseDto> askStudentDoubt(ChatbotRequestDto request, String authenticatedEmail) {
        ChatbotResponseDto response = new ChatbotResponseDto();

        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            response.setSuccess(false);
            response.setResponseMessage("Unauthorized access");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        if (request == null || request.getQuestion() == null || request.getQuestion().isBlank()) {
            response.setSuccess(false);
            response.setResponseMessage("Question is required");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        User student = this.userService.getUserByEmailIdAndRoleAndStatus(
                authenticatedEmail,
                UserRole.ROLE_STUDENT.value(),
                ActiveStatus.ACTIVE.value()
        );

        if (student == null) {
            response.setSuccess(false);
            response.setResponseMessage("Only logged-in students can access this chatbot");
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        try {
            String studentName = ((student.getFirstName() != null ? student.getFirstName().trim() : "")
                    + " "
                    + (student.getLastName() != null ? student.getLastName().trim() : "")).trim();

            String answer = this.studentDoubtChatService.solveDoubt(studentName, request.getQuestion().trim());

            response.setAnswer(answer);
            response.setSuccess(true);
            response.setResponseMessage("Doubt solved successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception ex) {
            LOG.error("Failed to process chatbot request for {}", authenticatedEmail, ex);
            response.setSuccess(false);
            response.setResponseMessage("Unable to get response from AI service right now");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
