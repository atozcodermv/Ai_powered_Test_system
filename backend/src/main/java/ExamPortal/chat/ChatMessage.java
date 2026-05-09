package ExamPortal.chat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessage {

    private String messageId;
    private Integer senderId;
    private Integer receiverId;
    private Integer teacherId;
    private Integer studentId;
    private String senderRole;
    private String messageContent;
    private Long timestamp;
    private String status;
    private String eventType;

}
