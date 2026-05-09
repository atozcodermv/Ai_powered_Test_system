package ExamPortal.repositories;

import ExamPortal.entities.Exam;
import ExamPortal.entities.ExamResult;
import ExamPortal.entities.Grade;
import ExamPortal.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Integer> {

	List<ExamResult> findByExam(Exam exam);

	List<ExamResult> findByStudent(User student);

	List<ExamResult> findByStudentAndExam(User student, Exam exam);

	List<ExamResult> findByExam_Grade(Grade grade);

	@org.springframework.data.jpa.repository.Query("SELECT e.exam.name, (e.score * 100.0 / e.totalMarks) FROM ExamResult e WHERE e.student.id = :studentId")
	List<Object[]> findExamPerformanceByStudentId(@org.springframework.data.repository.query.Param("studentId") int studentId);

}
