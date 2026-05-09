package ExamPortal.repositories;

import ExamPortal.entities.ForgotPasswordSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForgotPasswordSessionRepository extends JpaRepository<ForgotPasswordSession, String> {
    Optional<ForgotPasswordSession> findByEmailIgnoreCase(String email);
}
