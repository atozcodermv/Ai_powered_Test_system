package ExamPortal.services.impl;

import ExamPortal.entities.DescriptiveQuestion;
import ExamPortal.entities.Exam;
import ExamPortal.repositories.DescriptiveQuestionRepository;
import ExamPortal.services.DescriptiveQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DescriptiveQuestionServiceImpl implements DescriptiveQuestionService {

    @Autowired
    private DescriptiveQuestionRepository descriptiveQuestionRepository;

    @Override
    public List<DescriptiveQuestion> addQuestions(List<DescriptiveQuestion> questions) {
        return descriptiveQuestionRepository.saveAll(questions);
    }

    @Override
    public List<DescriptiveQuestion> getQuestionsByExam(Exam exam) {
        return descriptiveQuestionRepository.findByExamOrderByIdAsc(exam);
    }

    @Override
    public DescriptiveQuestion getQuestionById(int questionId) {
        Optional<DescriptiveQuestion> question = descriptiveQuestionRepository.findById(questionId);
        return question.orElse(null);
    }
}
