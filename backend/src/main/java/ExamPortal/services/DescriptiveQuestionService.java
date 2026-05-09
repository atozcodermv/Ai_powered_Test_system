package ExamPortal.services;

import ExamPortal.entities.DescriptiveQuestion;
import ExamPortal.entities.Exam;

import java.util.List;

public interface DescriptiveQuestionService {

    List<DescriptiveQuestion> addQuestions(List<DescriptiveQuestion> questions);

    List<DescriptiveQuestion> getQuestionsByExam(Exam exam);

    DescriptiveQuestion getQuestionById(int questionId);
}
