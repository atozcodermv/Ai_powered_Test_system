package ExamPortal.services.impl;

import ExamPortal.entities.LoginSecurity;
import ExamPortal.entities.User;
import ExamPortal.repositories.LoginSecurityRepository;
import ExamPortal.services.LoginSecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LoginSecurityServiceImpl implements LoginSecurityService {

    @Autowired
    private LoginSecurityRepository loginSecurityRepository;

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_DURATION_HOURS = 1;

    @Override
    public LoginSecurity getLoginSecurityForUser(User user) {
        Optional<LoginSecurity> optionalSecurity = loginSecurityRepository.findByUser(user);
        if (optionalSecurity.isPresent()) {
            return optionalSecurity.get();
        } else {
            LoginSecurity newSecurity = new LoginSecurity();
            newSecurity.setUser(user);
            newSecurity.setAttemptsCount(MAX_ATTEMPTS);
            newSecurity.setLocktime(null);
            return loginSecurityRepository.save(newSecurity);
        }
    }

    @Override
    public LoginSecurity recordFailedAttempt(LoginSecurity loginSecurity) {
        LocalDateTime now = LocalDateTime.now();

        if (loginSecurity.getLocktime() != null && loginSecurity.getLocktime().isAfter(now)) {
            // Should not happen if the check logic is correct, but just in case
            return loginSecurity;
        }

        // If the lock time has expired, they get exactly 1 attempt
        if (loginSecurity.getLocktime() != null && loginSecurity.getLocktime().isBefore(now)) {
             loginSecurity.setLocktime(now.plusHours(LOCK_DURATION_HOURS));
             loginSecurity.setAttemptsCount(1);
             return loginSecurityRepository.save(loginSecurity);
        }

        int newAttempts = loginSecurity.getAttemptsCount() - 1;
        
        if (newAttempts <= 0) {
            loginSecurity.setAttemptsCount(1);
            loginSecurity.setLocktime(now.plusHours(LOCK_DURATION_HOURS));
        } else {
            loginSecurity.setAttemptsCount(newAttempts);
        }

        return loginSecurityRepository.save(loginSecurity);
    }

    @Override
    public void resetLoginSecurity(LoginSecurity loginSecurity) {
        loginSecurity.setAttemptsCount(MAX_ATTEMPTS);
        loginSecurity.setLocktime(null);
        loginSecurityRepository.save(loginSecurity);
    }

    @Override
    public boolean isAccountLocked(LoginSecurity loginSecurity) {
        if (loginSecurity.getLocktime() == null) {
            return false;
        }
        return loginSecurity.getLocktime().isAfter(LocalDateTime.now());
    }

    @Override
    public String getLockMessage(LoginSecurity loginSecurity) {
        return "Your account has been temporarily locked due to multiple failed login attempts. Please try again after 1 hour.";
    }

    @Override
    public String getRemainingAttemptsMessage(LoginSecurity loginSecurity) {
        return "Invalid credentials. You have " + loginSecurity.getAttemptsCount() + " login attempts remaining.";
    }
}
