package ExamPortal.controllers;

import ExamPortal.dto.ChatHistoryResponseDto;
import ExamPortal.dto.ChatPresenceResponseDto;
import ExamPortal.services.ChatMessagingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatRestController {

    private final ChatMessagingService chatMessagingService;

    public ChatRestController(ChatMessagingService chatMessagingService) {
        this.chatMessagingService = chatMessagingService;
    }

    @GetMapping("/history")
    public ResponseEntity<ChatHistoryResponseDto> getHistory(
            @RequestParam("teacherId") Integer teacherId,
            @RequestParam("studentId") Integer studentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(this.chatMessagingService.getThreadHistory(teacherId, studentId, authentication));
    }

    @GetMapping("/presence")
    public ResponseEntity<ChatPresenceResponseDto> getPresence(
            @RequestParam("userIds") List<Integer> userIds,
            Authentication authentication
    ) {
        return ResponseEntity.ok(this.chatMessagingService.getPresence(userIds, authentication));
    }
}
