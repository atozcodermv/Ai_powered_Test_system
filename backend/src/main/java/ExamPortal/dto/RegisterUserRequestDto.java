package ExamPortal.dto;

import ExamPortal.dto.validation.AdminValidationGroup;
import ExamPortal.dto.validation.UserValidationGroup;
import ExamPortal.entities.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

@Setter
@Getter
public class RegisterUserRequestDto {

	@NotBlank(message = "First Name is required", groups = UserValidationGroup.class)
	@Size(min = 2, max = 50, message = "First Name must be between 2 and 50 characters", groups = UserValidationGroup.class)
	@Pattern(regexp = "^[A-Za-z]{2,50}$", message = "First Name must contain only alphabetic characters", groups = UserValidationGroup.class)
	private String firstName;

	@NotBlank(message = "Last Name is required", groups = UserValidationGroup.class)
	@Size(min = 2, max = 50, message = "Last Name must be between 2 and 50 characters", groups = UserValidationGroup.class)
	@Pattern(regexp = "^[A-Za-z]{2,50}$", message = "Last Name must contain only alphabetic characters", groups = UserValidationGroup.class)
	private String lastName;

	@NotBlank(message = "Email Id is required", groups = {AdminValidationGroup.class, UserValidationGroup.class})
	@Email(message = "Email Id must be a valid email address", groups = {AdminValidationGroup.class, UserValidationGroup.class})
	@Size(max = 254, message = "Email Id must not exceed 254 characters", groups = {AdminValidationGroup.class, UserValidationGroup.class})
	@Pattern(regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$", message = "Email Id format is invalid", groups = {AdminValidationGroup.class, UserValidationGroup.class})
	private String emailId;

	@NotBlank(message = "Password is required", groups = {AdminValidationGroup.class, UserValidationGroup.class})
	@Size(min = 8, max = 16, message = "Password must be between 8 and 16 characters", groups = {AdminValidationGroup.class, UserValidationGroup.class})
	@Pattern(
			regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$",
			message = "Password must include uppercase, lowercase, number, and special character",
			groups = {AdminValidationGroup.class, UserValidationGroup.class}
	)
	private String password;

	@NotBlank(message = "Contact Number is required", groups = UserValidationGroup.class)
	@Pattern(regexp = "^[6-9][0-9]{9}$", message = "Contact Number must be a valid 10-digit Indian mobile number", groups = UserValidationGroup.class)
	private String phoneNo;

	@NotBlank(message = "Role is required", groups = UserValidationGroup.class)
	private String role;

	@NotBlank(message = "Street is required", groups = UserValidationGroup.class)
	@Size(min = 5, max = 100, message = "Street must be between 5 and 100 characters", groups = UserValidationGroup.class)
	@Pattern(regexp = "^[A-Za-z0-9 ,.-]{5,100}$", message = "Street contains invalid characters", groups = UserValidationGroup.class)
	private String street;

	@NotBlank(message = "City is required", groups = UserValidationGroup.class)
	@Size(min = 2, max = 50, message = "City must be between 2 and 50 characters", groups = UserValidationGroup.class)
	@Pattern(regexp = "^[A-Za-z ]{2,50}$", message = "City must contain only letters and spaces", groups = UserValidationGroup.class)
	private String city;

	@NotBlank(message = "Pincode is required", groups = UserValidationGroup.class)
	@Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be a valid 6-digit Indian postal code", groups = UserValidationGroup.class)
	private String pincode;

	private int gradeId;

	private int teacherId;

	private String publicId;

	public static User toUserEntity(RegisterUserRequestDto registerUserRequestDto) {
		User user = new User();
		BeanUtils.copyProperties(registerUserRequestDto, user);
		return user;
	}

}
