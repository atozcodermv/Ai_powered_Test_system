package ExamPortal.dto;

import ExamPortal.chat.ChatMessage;
import ExamPortal.entities.CommonApiResponse;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ChatHistoryResponseDto extends CommonApiResponse {

    private List<ChatMessage> messages = new ArrayList<>();

}
