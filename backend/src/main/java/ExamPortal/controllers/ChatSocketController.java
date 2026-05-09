package ExamPortal.controllers;

import ExamPortal.chat.ChatMessage;
import ExamPortal.dto.ChatReceiptRequestDto;
import ExamPortal.services.ChatMessagingService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatSocketController {

    private final ChatMessagingService chatMessagingService;

    public ChatSocketController(ChatMessagingService chatMessagingService) {
        this.chatMessagingService = chatMessagingService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessage message, Principal principal) {
        this.chatMessagingService.handleOutgoingMessage(message, principal);
    }

    @MessageMapping("/chat.delivered")
    public void markDelivered(ChatReceiptRequestDto request, Principal principal) {
        this.chatMessagingService.markDelivered(request, principal);
    }

    @MessageMapping("/chat.read")
    public void markRead(ChatReceiptRequestDto request, Principal principal) {
        this.chatMessagingService.markRead(request, principal);
    }
}
