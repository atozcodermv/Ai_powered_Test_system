package ExamPortal.repositories;

import ExamPortal.entities.DescriptiveAnswer;
import ExamPortal.entities.DescriptiveQuestion;
import ExamPortal.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DescriptiveAnswerRepository extends JpaRepository<DescriptiveAnswer, Integer> {

    List<DescriptiveAnswer> findByQuestion_Exam_Id(int examId);

    List<DescriptiveAnswer> findByQuestion_Exam_IdAndStudent_Id(int examId, int studentId);

    List<DescriptiveAnswer> findByStudent(User student);

    List<DescriptiveAnswer> findByQuestionInAndStudent(List<DescriptiveQuestion> questions, User student);
}
