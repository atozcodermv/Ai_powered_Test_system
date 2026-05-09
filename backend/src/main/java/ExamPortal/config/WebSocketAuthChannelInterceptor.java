package ExamPortal.config;

import ExamPortal.entities.User;
import ExamPortal.services.UserService;
import ExamPortal.utility.Constants.ActiveStatus;
import ExamPortal.utility.JwtUtils;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtils jwtUtils;
    private final UserService userService;

    public WebSocketAuthChannelInterceptor(JwtUtils jwtUtils, UserService userService) {
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        String authorizationHeader = getHeaderValue(accessor, "Authorization");
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing websocket authorization token");
        }

        String token = authorizationHeader.substring(7);
        String email = jwtUtils.extractUsername(token);
        User user = this.userService.getUserByEmailAndStatus(email, ActiveStatus.ACTIVE.value());

        if (user == null) {
            throw new IllegalArgumentException("Invalid websocket user");
        }

        String requestedUserId = getHeaderValue(accessor, "userId");
        String requestedRole = getHeaderValue(accessor, "role");

        if (requestedUserId != null && !requestedUserId.equals(String.valueOf(user.getId()))) {
            throw new IllegalArgumentException("Websocket user mismatch");
        }

        if (requestedRole != null && !requestedRole.equals(user.getRole())) {
            throw new IllegalArgumentException("Websocket role mismatch");
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.getEmailId(),
                null,
                List.of(new SimpleGrantedAuthority(user.getRole()))
        );

        accessor.setUser(authentication);
        accessor.getSessionAttributes().put("userId", user.getId());
        accessor.getSessionAttributes().put("role", user.getRole());
        accessor.getSessionAttributes().put("email", user.getEmailId());

        return message;
    }

    private String getHeaderValue(StompHeaderAccessor accessor, String headerName) {
        String headerValue = accessor.getFirstNativeHeader(headerName);
        return headerValue != null ? headerValue : accessor.getFirstNativeHeader(headerName.toLowerCase());
    }
}
