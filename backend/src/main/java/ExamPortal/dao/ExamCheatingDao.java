package ExamPortal.dao;

import ExamPortal.entities.ExamCheating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamCheatingDao extends JpaRepository<ExamCheating, Integer> {
    
    List<ExamCheating> findByStudentIdAndExamId(int studentId, int examId);

}
