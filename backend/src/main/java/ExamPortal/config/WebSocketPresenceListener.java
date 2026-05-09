package ExamPortal.config;

import ExamPortal.services.ChatMessagingService;
import ExamPortal.services.ChatPresenceService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketPresenceListener {

    private final ChatPresenceService chatPresenceService;
    private final ChatMessagingService chatMessagingService;

    public WebSocketPresenceListener(ChatPresenceService chatPresenceService, ChatMessagingService chatMessagingService) {
        this.chatPresenceService = chatPresenceService;
        this.chatMessagingService = chatMessagingService;
    }

    @EventListener
    public void handleWebSocketConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Integer userId = getIntegerAttribute(accessor, "userId");
        String role = getStringAttribute(accessor, "role");

        if (this.chatPresenceService.registerConnection(accessor.getSessionId(), userId, role)) {
            this.chatMessagingService.broadcastPresence(userId, role, true);
        }
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        Integer userId = getIntegerAttribute(StompHeaderAccessor.wrap(event.getMessage()), "userId");
        boolean becameOffline = this.chatPresenceService.unregisterConnection(event.getSessionId());

        if (becameOffline) {
            this.chatMessagingService.broadcastPresence(userId, this.chatPresenceService.getRole(userId), false);
        }
    }

    private Integer getIntegerAttribute(StompHeaderAccessor accessor, String attributeName) {
        Object value = accessor.getSessionAttributes() != null ? accessor.getSessionAttributes().get(attributeName) : null;
        if (value == null) {
            return null;
        }

        return Integer.parseInt(String.valueOf(value));
    }

    private String getStringAttribute(StompHeaderAccessor accessor, String attributeName) {
        Object value = accessor.getSessionAttributes() != null ? accessor.getSessionAttributes().get(attributeName) : null;
        return value != null ? String.valueOf(value) : null;
    }
}
