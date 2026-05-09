package ExamPortal.entities;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class DescriptiveEvaluationView {

    private Exam exam;

    private User student;

    private ExamResult examResult;

    private List<QuestionEvaluationItem> questionEvaluations = new ArrayList<>();

    @Setter
    @Getter
    public static class QuestionEvaluationItem {
        private int questionId;
        private String questionContent;
        private double totalMarks;
        private String answerContent;
        private Double score;
        private String evaluationStatus;
    }
}
