package ExamPortal.chat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatPresenceEvent {

    private Integer userId;
    private String role;
    private Boolean online;
    private Long timestamp;
    private String eventType = ChatEventType.PRESENCE.name();

}
