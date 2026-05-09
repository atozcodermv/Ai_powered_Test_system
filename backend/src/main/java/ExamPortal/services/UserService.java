package ExamPortal.services;

import ExamPortal.entities.User;

import java.util.List;

public interface UserService {

	User addUser(User user);
	
	User updateUser(User user);

	User getUserByEmailAndStatus(String emailId, String status);

	User getUserByEmailid(String emailId);

	User findByRoleAndStatusIn(String emailId, List<String> status);

	List<User> getUserByRole(String role);
	
	User getUserById(int userId);
		
	User getUserByEmailIdAndRoleAndStatus(String emailId, String role, String status);
	
	List<User> updateAllUser(List<User> users);
	
	List<User> getUserByRoleAndStatus(String role, String status);
	
	List<User> getUsersByRoleAndTeacherAndStatus(String role, User teacher, String status);

	List<User> getUsersByRoleAndTeacher(String role, User teacher);

	void deleteUser(User user);
	
}
