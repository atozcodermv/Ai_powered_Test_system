package ExamPortal.controllers;

import ExamPortal.dto.ChatbotRequestDto;
import ExamPortal.dto.ChatbotResponseDto;
import ExamPortal.resource.ChatbotResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/chatbot")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatbotController {

    private final ChatbotResource chatbotResource;

    public ChatbotController(ChatbotResource chatbotResource) {
        this.chatbotResource = chatbotResource;
    }

    @PostMapping("/student/ask-doubt")
    @PreAuthorize("hasAuthority('Student')")
    public ResponseEntity<ChatbotResponseDto> askStudentDoubt(
            @RequestBody ChatbotRequestDto request,
            Authentication authentication
    ) {
        String authenticatedEmail = authentication != null ? authentication.getName() : null;
        return this.chatbotResource.askStudentDoubt(request, authenticatedEmail);
    }
}
