package ExamPortal.services;

import ExamPortal.chat.ChatEventType;
import ExamPortal.chat.ChatMessage;
import ExamPortal.chat.ChatMessageStatus;
import ExamPortal.chat.ChatPresenceEvent;
import ExamPortal.dto.ChatHistoryResponseDto;
import ExamPortal.dto.ChatPresenceResponseDto;
import ExamPortal.dto.ChatReceiptRequestDto;
import ExamPortal.entities.User;
import ExamPortal.utility.Constants.ActiveStatus;
import ExamPortal.utility.Constants.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ChatMessagingService {

    private static final Logger LOG = LoggerFactory.getLogger(ChatMessagingService.class);

    private final UserService userService;
    private final ChatConversationService chatConversationService;
    private final ChatPresenceService chatPresenceService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public ChatMessagingService(
            UserService userService,
            ChatConversationService chatConversationService,
            ChatPresenceService chatPresenceService,
            SimpMessagingTemplate simpMessagingTemplate
    ) {
        this.userService = userService;
        this.chatConversationService = chatConversationService;
        this.chatPresenceService = chatPresenceService;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public void handleOutgoingMessage(ChatMessage incomingMessage, Principal principal) {
        User sender = resolveAuthenticatedUser(principal);
        if (sender == null || incomingMessage == null || incomingMessage.getMessageContent() == null
                || incomingMessage.getMessageContent().isBlank()) {
            return;
        }

        ChatMessage normalizedMessage = normalizeMessage(incomingMessage, sender);
        if (normalizedMessage == null) {
            return;
        }

        this.chatConversationService.save(normalizedMessage);

        sendToUser(normalizedMessage.getSenderId(), normalizedMessage);
        if (!normalizedMessage.getReceiverId().equals(normalizedMessage.getSenderId())) {
            sendToUser(normalizedMessage.getReceiverId(), normalizedMessage);
        }
    }

    public void markDelivered(ChatReceiptRequestDto request, Principal principal) {
        updateMessageStatus(request, principal, ChatMessageStatus.DELIVERED);
    }

    public void markRead(ChatReceiptRequestDto request, Principal principal) {
        updateMessageStatus(request, principal, ChatMessageStatus.READ);
    }

    public ChatHistoryResponseDto getThreadHistory(Integer teacherId, Integer studentId, Principal principal) {
        ChatHistoryResponseDto response = new ChatHistoryResponseDto();
        User requester = resolveAuthenticatedUser(principal);

        if (requester == null) {
            response.setSuccess(false);
            response.setResponseMessage("Unauthorized access");
            return response;
        }

        if (teacherId == null || teacherId == 0 || studentId == null || studentId == 0) {
            response.setSuccess(false);
            response.setResponseMessage("Teacher Id and Student Id are required");
            return response;
        }

        if (!canAccessThread(requester, teacherId, studentId)) {
            response.setSuccess(false);
            response.setResponseMessage("You are not allowed to access this chat thread");
            return response;
        }

        response.setMessages(this.chatConversationService.getThreadMessages(teacherId, studentId));
        response.setSuccess(true);
        response.setResponseMessage("Chat history fetched successfully");
        return response;
    }

    public ChatPresenceResponseDto getPresence(List<Integer> userIds, Principal principal) {
        ChatPresenceResponseDto response = new ChatPresenceResponseDto();
        User requester = resolveAuthenticatedUser(principal);

        if (requester == null) {
            response.setSuccess(false);
            response.setResponseMessage("Unauthorized access");
            return response;
        }

        response.setPresenceMap(this.chatPresenceService.getPresenceSnapshot(userIds));
        response.setSuccess(true);
        response.setResponseMessage("Presence fetched successfully");
        return response;
    }

    public void broadcastPresence(Integer userId, String role, boolean online) {
        if (userId == null || role == null || role.isBlank()) {
            return;
        }

        ChatPresenceEvent event = new ChatPresenceEvent();
        event.setUserId(userId);
        event.setRole(role);
        event.setOnline(online);
        event.setTimestamp(Instant.now().toEpochMilli());
        simpMessagingTemplate.convertAndSend("/topic/presence", event);
    }

    private void updateMessageStatus(ChatReceiptRequestDto request, Principal principal, ChatMessageStatus nextStatus) {
        User actor = resolveAuthenticatedUser(principal);
        if (actor == null || request == null || request.getMessageId() == null || request.getMessageId().isBlank()) {
            return;
        }

        ChatMessage message = this.chatConversationService.getMessage(request.getMessageId());
        if (message == null || actor.getId() != message.getReceiverId()) {
            return;
        }

        ChatMessage updatedMessage = this.chatConversationService.updateStatus(request.getMessageId(), nextStatus);
        if (updatedMessage == null) {
            return;
        }

        ChatMessage statusEvent = copyMessage(updatedMessage);
        statusEvent.setEventType(ChatEventType.STATUS.name());
        sendToUser(updatedMessage.getSenderId(), statusEvent);
        sendToUser(updatedMessage.getReceiverId(), statusEvent);
    }

    private ChatMessage normalizeMessage(ChatMessage incomingMessage, User sender) {
        User teacher;
        User student;
        User receiver;

        if (UserRole.ROLE_STUDENT.value().equals(sender.getRole())) {
            student = sender;
            teacher = sender.getTeacher();

            if (teacher == null) {
                LOG.warn("Student {} does not have an assigned teacher for chat", sender.getId());
                return null;
            }

            receiver = teacher;
        } else if (UserRole.ROLE_TEACHER.value().equals(sender.getRole())) {
            teacher = sender;
            student = this.userService.getUserById(incomingMessage.getStudentId() != null ? incomingMessage.getStudentId() : 0);

            if (student == null || student.getTeacher() == null || student.getTeacher().getId() != teacher.getId()) {
                LOG.warn("Teacher {} attempted to message invalid student {}", teacher.getId(), incomingMessage.getStudentId());
                return null;
            }

            receiver = student;
        } else {
            return null;
        }

        ChatMessage message = new ChatMessage();
        message.setMessageId(UUID.randomUUID().toString());
        message.setSenderId(sender.getId());
        message.setReceiverId(receiver.getId());
        message.setTeacherId(teacher.getId());
        message.setStudentId(student.getId());
        message.setSenderRole(sender.getRole());
        message.setMessageContent(incomingMessage.getMessageContent().trim());
        message.setTimestamp(Instant.now().toEpochMilli());
        message.setStatus(ChatMessageStatus.SENT.name());
        message.setEventType(ChatEventType.MESSAGE.name());
        return message;
    }

    private boolean canAccessThread(User requester, Integer teacherId, Integer studentId) {
        if (UserRole.ROLE_TEACHER.value().equals(requester.getRole())) {
            if (requester.getId() != teacherId) {
                return false;
            }

            User student = this.userService.getUserById(studentId);
            return student != null && student.getTeacher() != null && student.getTeacher().getId() == requester.getId();
        }

        if (UserRole.ROLE_STUDENT.value().equals(requester.getRole())) {
            return requester.getId() == studentId
                    && requester.getTeacher() != null
                    && requester.getTeacher().getId() == teacherId;
        }

        return false;
    }

    private User resolveAuthenticatedUser(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return null;
        }

        return this.userService.getUserByEmailAndStatus(principal.getName(), ActiveStatus.ACTIVE.value());
    }

    private void sendToUser(Integer userId, Object payload) {
        if (userId == null) {
            return;
        }

        this.simpMessagingTemplate.convertAndSend("/topic/chat/user." + userId, payload);
    }

    private ChatMessage copyMessage(ChatMessage original) {
        ChatMessage copy = new ChatMessage();
        copy.setMessageId(original.getMessageId());
        copy.setSenderId(original.getSenderId());
        copy.setReceiverId(original.getReceiverId());
        copy.setTeacherId(original.getTeacherId());
        copy.setStudentId(original.getStudentId());
        copy.setSenderRole(original.getSenderRole());
        copy.setMessageContent(original.getMessageContent());
        copy.setTimestamp(original.getTimestamp());
        copy.setStatus(original.getStatus());
        copy.setEventType(original.getEventType());
        return copy;
    }
}
