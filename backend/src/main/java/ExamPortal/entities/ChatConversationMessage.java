package ExamPortal.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(name = "idx_chat_teacher_student_timestamp", columnList = "teacher_id, student_id, timestamp"),
                @Index(name = "idx_chat_receiver_status", columnList = "receiver_id, status")
        }
)
public class ChatConversationMessage {

    @Id
    @Column(name = "message_id", nullable = false, length = 64)
    private String messageId;

    @Column(name = "sender_id", nullable = false)
    private Integer senderId;

    @Column(name = "receiver_id", nullable = false)
    private Integer receiverId;

    @Column(name = "teacher_id", nullable = false)
    private Integer teacherId;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "sender_role", nullable = false, length = 32)
    private String senderRole;

    @Column(name = "message_content", nullable = false, length = 4000)
    private String messageContent;

    @Column(name = "timestamp", nullable = false)
    private Long timestamp;

    @Column(name = "status", nullable = false, length = 32)
    private String status;
}
