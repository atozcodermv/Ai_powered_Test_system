package ExamPortal.repositories;

import ExamPortal.entities.ChatConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatConversationMessageRepository extends JpaRepository<ChatConversationMessage, String> {

    List<ChatConversationMessage> findByTeacherIdAndStudentIdOrderByTimestampAsc(Integer teacherId, Integer studentId);
}
