package ExamPortal.repositories;

import ExamPortal.entities.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {

	Optional<PendingRegistration> findByEmailId(String emailId);

}
