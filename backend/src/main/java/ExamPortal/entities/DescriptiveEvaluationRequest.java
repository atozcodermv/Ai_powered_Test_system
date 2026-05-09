package ExamPortal.entities;

import lombok.Getter;
import lombok.Setter;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class DescriptiveEvaluationRequest {

    private int examId;

    private int studentId;

    private List<DescriptiveScorePayload> evaluations = new ArrayList<>();

    public static boolean validate(DescriptiveEvaluationRequest request) {
        if (request == null || request.getExamId() == 0 || request.getStudentId() == 0 || CollectionUtils.isEmpty(request.getEvaluations())) {
            return false;
        }

        for (DescriptiveScorePayload evaluation : request.getEvaluations()) {
            if (evaluation == null || evaluation.getQuestionId() == 0 || evaluation.getScore() == null || evaluation.getScore() < 0) {
                return false;
            }
        }

        return true;
    }

    @Setter
    @Getter
    public static class DescriptiveScorePayload {
        private int questionId;
        private Double score;
    }
}
