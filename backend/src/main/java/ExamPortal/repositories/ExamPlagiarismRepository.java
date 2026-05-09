package ExamPortal.repositories;

import ExamPortal.entities.Exam;
import ExamPortal.entities.ExamPlagiarism;
import ExamPortal.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamPlagiarismRepository extends JpaRepository<ExamPlagiarism, Integer> {
    List<ExamPlagiarism> findByExam(Exam exam);
    List<ExamPlagiarism> findByStudent(User student);
}

