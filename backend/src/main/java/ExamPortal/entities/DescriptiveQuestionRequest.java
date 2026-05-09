package ExamPortal.entities;

import lombok.Getter;
import lombok.Setter;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class DescriptiveQuestionRequest {

    private int examId;

    private List<DescriptiveQuestionPayload> questions = new ArrayList<>();

    public static boolean validate(DescriptiveQuestionRequest request) {
        if (request == null || request.getExamId() == 0 || CollectionUtils.isEmpty(request.getQuestions())) {
            return false;
        }

        for (DescriptiveQuestionPayload question : request.getQuestions()) {
            if (question == null
                    || question.getQuestionContent() == null
                    || question.getQuestionContent().isBlank()
                    || question.getTotalMarks() <= 0) {
                return false;
            }
        }

        return true;
    }

    @Setter
    @Getter
    public static class DescriptiveQuestionPayload {
        private String questionContent;
        private double totalMarks;
    }
}
