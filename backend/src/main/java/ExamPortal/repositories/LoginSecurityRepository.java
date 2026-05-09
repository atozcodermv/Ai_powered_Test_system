package ExamPortal.repositories;

import ExamPortal.entities.LoginSecurity;
import ExamPortal.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginSecurityRepository extends JpaRepository<LoginSecurity, Integer> {
    Optional<LoginSecurity> findByUser(User user);
}
