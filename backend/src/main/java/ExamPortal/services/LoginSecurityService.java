package ExamPortal.services;

import ExamPortal.entities.LoginSecurity;
import ExamPortal.entities.User;

public interface LoginSecurityService {

    LoginSecurity getLoginSecurityForUser(User user);

    LoginSecurity recordFailedAttempt(LoginSecurity loginSecurity);

    void resetLoginSecurity(LoginSecurity loginSecurity);
    
    boolean isAccountLocked(LoginSecurity loginSecurity);

    String getLockMessage(LoginSecurity loginSecurity);
    
    String getRemainingAttemptsMessage(LoginSecurity loginSecurity);

}
