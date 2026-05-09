package ExamPortal.repositories;

import ExamPortal.entities.Grade;
import ExamPortal.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Integer> {

	List<Grade> findByStatus(String status);

	List<Grade> findByTeachersContaining(User teacher);

	List<Grade> findByTeachersContainingAndStatus(User teacher, String status);
	
}
