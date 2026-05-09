package ExamPortal.entities;

import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class DescriptiveAnswerSubmissionRequest {

    private int examId;

    private int studentId;

    private List<DescriptiveAnswerPayload> answers = new ArrayList<>();
    
    @JsonProperty("isAutoSubmit")
    private boolean isAutoSubmit;
    
    private String violationReason;

    public static boolean validate(DescriptiveAnswerSubmissionRequest request) {
        if (request == null || request.getExamId() == 0 || request.getStudentId() == 0 || CollectionUtils.isEmpty(request.getAnswers())) {
            return false;
        }

        for (DescriptiveAnswerPayload answer : request.getAnswers()) {
            if (answer == null || answer.getQuestionId() == 0) {
                return false;
            }
            // If it's not an auto-submit, an empty answer is a validation failure.
            // If it IS an auto-submit, we allow blank answers.
            if (!request.isAutoSubmit() && (answer.getAnswerContent() == null || answer.getAnswerContent().isBlank())) {
                return false;
            }
        }

        return true;
    }

    @Setter
    @Getter
    public static class DescriptiveAnswerPayload {
        private int questionId;
        private String answerContent;
    }
}
