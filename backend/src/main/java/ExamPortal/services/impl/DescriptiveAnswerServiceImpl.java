package ExamPortal.services.impl;

import ExamPortal.entities.DescriptiveAnswer;
import ExamPortal.entities.DescriptiveQuestion;
import ExamPortal.entities.User;
import ExamPortal.repositories.DescriptiveAnswerRepository;
import ExamPortal.services.DescriptiveAnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DescriptiveAnswerServiceImpl implements DescriptiveAnswerService {

    @Autowired
    private DescriptiveAnswerRepository descriptiveAnswerRepository;

    @Override
    public List<DescriptiveAnswer> saveAll(List<DescriptiveAnswer> answers) {
        return descriptiveAnswerRepository.saveAll(answers);
    }

    @Override
    public List<DescriptiveAnswer> getAnswersByExam(int examId) {
        return descriptiveAnswerRepository.findByQuestion_Exam_Id(examId);
    }

    @Override
    public List<DescriptiveAnswer> getAnswersByExamAndStudent(int examId, int studentId) {
        return descriptiveAnswerRepository.findByQuestion_Exam_IdAndStudent_Id(examId, studentId);
    }

    @Override
    public List<DescriptiveAnswer> getAnswersByQuestionsAndStudent(List<DescriptiveQuestion> questions, User student) {
        return descriptiveAnswerRepository.findByQuestionInAndStudent(questions, student);
    }
}
