package ExamPortal.dto;

import ExamPortal.entities.Address;
import ExamPortal.entities.Grade;
import ExamPortal.entities.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

@Setter
@Getter
public class UserDto {

	private int id;

	private String firstName;

	private String lastName;

	private String emailId;

	private String phoneNo;

	private String role;

	private Address address;

	private Grade grade;

	private User teacher;

	private String status;

<<<<<<< HEAD
	public static UserDto toUserDtoEntity(User user, Grade grade) {
=======
	private String publicId;

	public static UserDto toUserDtoEntity(User user, Grade grade, List<Grade> grades) {
>>>>>>> 722e9e9 (profile pic upload feature added)
		UserDto userDto = new UserDto();
		if (user == null) {
			return userDto;
		}
		BeanUtils.copyProperties(user, userDto);
		userDto.setGrade(grade);
		return userDto;
	}

}
