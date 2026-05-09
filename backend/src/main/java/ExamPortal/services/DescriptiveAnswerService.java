package ExamPortal.services;

import ExamPortal.entities.DescriptiveAnswer;
import ExamPortal.entities.DescriptiveQuestion;
import ExamPortal.entities.User;

import java.util.List;

public interface DescriptiveAnswerService {

    List<DescriptiveAnswer> saveAll(List<DescriptiveAnswer> answers);

    List<DescriptiveAnswer> getAnswersByExam(int examId);

    List<DescriptiveAnswer> getAnswersByExamAndStudent(int examId, int studentId);

    List<DescriptiveAnswer> getAnswersByQuestionsAndStudent(List<DescriptiveQuestion> questions, User student);
}
