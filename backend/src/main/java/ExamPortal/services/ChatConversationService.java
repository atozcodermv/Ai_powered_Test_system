package ExamPortal.services;

import ExamPortal.chat.ChatMessage;
import ExamPortal.chat.ChatMessageStatus;
import ExamPortal.entities.ChatConversationMessage;
import ExamPortal.repositories.ChatConversationMessageRepository;
<<<<<<< HEAD
=======
import org.springframework.beans.factory.annotation.Autowired;
>>>>>>> dd1627d (add the logic of plagiarism detection)
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
<<<<<<< HEAD
=======
import java.util.Optional;
>>>>>>> dd1627d (add the logic of plagiarism detection)
import java.util.stream.Collectors;

@Service
public class ChatConversationService {

<<<<<<< HEAD
    private final ChatConversationMessageRepository chatConversationMessageRepository;

    public ChatConversationService(ChatConversationMessageRepository chatConversationMessageRepository) {
        this.chatConversationMessageRepository = chatConversationMessageRepository;
=======
    @Autowired
    private ChatConversationMessageRepository chatRepository;

    public ChatMessage save(ChatMessage message) {
        ChatConversationMessage entity = new ChatConversationMessage();
        entity.setMessageId(message.getMessageId());
        entity.setSenderId(message.getSenderId());
        entity.setReceiverId(message.getReceiverId());
        entity.setTeacherId(message.getTeacherId());
        entity.setStudentId(message.getStudentId());
        entity.setSenderRole(message.getSenderRole());
        entity.setMessageContent(message.getMessageContent());
        entity.setTimestamp(message.getTimestamp());
        entity.setStatus(message.getStatus());
        
        chatRepository.save(entity);
        return message;
>>>>>>> dd1627d (add the logic of plagiarism detection)
    }

    @Transactional
    public ChatMessage save(ChatMessage message) {
        ChatConversationMessage savedMessage = this.chatConversationMessageRepository.save(toEntity(message));
        return toDto(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getThreadMessages(Integer teacherId, Integer studentId) {
        if (teacherId == null || studentId == null) {
            return List.of();
        }

<<<<<<< HEAD
        return this.chatConversationMessageRepository.findByTeacherIdAndStudentIdOrderByTimestampAsc(teacherId, studentId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
=======
        List<ChatConversationMessage> entities = chatRepository.findByTeacherIdAndStudentIdOrderByTimestampAsc(teacherId, studentId);
        
        return entities.stream().map(entity -> {
            ChatMessage dto = new ChatMessage();
            dto.setMessageId(entity.getMessageId());
            dto.setSenderId(entity.getSenderId());
            dto.setReceiverId(entity.getReceiverId());
            dto.setTeacherId(entity.getTeacherId());
            dto.setStudentId(entity.getStudentId());
            dto.setSenderRole(entity.getSenderRole());
            dto.setMessageContent(entity.getMessageContent());
            dto.setTimestamp(entity.getTimestamp());
            dto.setStatus(entity.getStatus());
            return dto;
        }).collect(Collectors.toList());
>>>>>>> dd1627d (add the logic of plagiarism detection)
    }

    @Transactional
    public ChatMessage updateStatus(String messageId, ChatMessageStatus nextStatus) {
        if (messageId == null || messageId.isBlank() || nextStatus == null) {
            return null;
        }

<<<<<<< HEAD
        ChatConversationMessage existingMessage = this.chatConversationMessageRepository.findById(messageId).orElse(null);
        if (existingMessage == null || existingMessage.getStatus() == null) {
            return existingMessage == null ? null : toDto(existingMessage);
=======
        Optional<ChatConversationMessage> optionalEntity = chatRepository.findById(messageId);
        if (optionalEntity.isEmpty()) {
            return null;
>>>>>>> dd1627d (add the logic of plagiarism detection)
        }

        ChatConversationMessage entity = optionalEntity.get();
        if (entity.getStatus() == null) {
            return mapToDto(entity);
        }

        ChatMessageStatus currentStatus;
        try {
            currentStatus = ChatMessageStatus.valueOf(entity.getStatus());
        } catch (IllegalArgumentException e) {
            return mapToDto(entity);
        }
        
        if (nextStatus.ordinal() <= currentStatus.ordinal()) {
<<<<<<< HEAD
            return toDto(existingMessage);
        }

        existingMessage.setStatus(nextStatus.name());
        return toDto(this.chatConversationMessageRepository.save(existingMessage));
=======
            return mapToDto(entity);
        }

        entity.setStatus(nextStatus.name());
        chatRepository.save(entity);
        return mapToDto(entity);
>>>>>>> dd1627d (add the logic of plagiarism detection)
    }

    @Transactional(readOnly = true)
    public ChatMessage getMessage(String messageId) {
<<<<<<< HEAD
        return this.chatConversationMessageRepository.findById(messageId)
                .map(this::toDto)
                .orElse(null);
    }

    private ChatConversationMessage toEntity(ChatMessage message) {
        ChatConversationMessage entity = new ChatConversationMessage();
        entity.setMessageId(message.getMessageId());
        entity.setSenderId(message.getSenderId());
        entity.setReceiverId(message.getReceiverId());
        entity.setTeacherId(message.getTeacherId());
        entity.setStudentId(message.getStudentId());
        entity.setSenderRole(message.getSenderRole());
        entity.setMessageContent(message.getMessageContent());
        entity.setTimestamp(message.getTimestamp());
        entity.setStatus(message.getStatus());
        return entity;
    }

    private ChatMessage toDto(ChatConversationMessage entity) {
        ChatMessage message = new ChatMessage();
        message.setMessageId(entity.getMessageId());
        message.setSenderId(entity.getSenderId());
        message.setReceiverId(entity.getReceiverId());
        message.setTeacherId(entity.getTeacherId());
        message.setStudentId(entity.getStudentId());
        message.setSenderRole(entity.getSenderRole());
        message.setMessageContent(entity.getMessageContent());
        message.setTimestamp(entity.getTimestamp());
        message.setStatus(entity.getStatus());
        message.setEventType("MESSAGE");
        return message;
=======
        Optional<ChatConversationMessage> optionalEntity = chatRepository.findById(messageId);
        return optionalEntity.map(this::mapToDto).orElse(null);
    }

    private ChatMessage mapToDto(ChatConversationMessage entity) {
        ChatMessage dto = new ChatMessage();
        dto.setMessageId(entity.getMessageId());
        dto.setSenderId(entity.getSenderId());
        dto.setReceiverId(entity.getReceiverId());
        dto.setTeacherId(entity.getTeacherId());
        dto.setStudentId(entity.getStudentId());
        dto.setSenderRole(entity.getSenderRole());
        dto.setMessageContent(entity.getMessageContent());
        dto.setTimestamp(entity.getTimestamp());
        dto.setStatus(entity.getStatus());
        return dto;
>>>>>>> dd1627d (add the logic of plagiarism detection)
    }
}
