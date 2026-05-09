package ExamPortal.repositories;

import ExamPortal.entities.DescriptiveQuestion;
import ExamPortal.entities.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DescriptiveQuestionRepository extends JpaRepository<DescriptiveQuestion, Integer> {

    List<DescriptiveQuestion> findByExamOrderByIdAsc(Exam exam);
}
