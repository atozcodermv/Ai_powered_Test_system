package ExamPortal.dto;

import ExamPortal.entities.CommonApiResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatbotResponseDto extends CommonApiResponse {

    private String answer;

}
