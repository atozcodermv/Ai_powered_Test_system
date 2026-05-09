package ExamPortal.controllers;

import ExamPortal.dto.*;
import ExamPortal.dto.validation.AdminValidationGroup;
import ExamPortal.dto.validation.UserValidationGroup;
import ExamPortal.entities.CommonApiResponse;
import ExamPortal.entities.UserLoginRequest;
import ExamPortal.entities.UserLoginResponse;
import ExamPortal.resource.UserResource;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/user")
@CrossOrigin(origins = "localhost:3000")
public class UserController {

	@Autowired
	private UserResource userResource;

	// RegisterUserRequestDto, we will set only email, password & role from UI
	@PostMapping("/admin/register")
	// Api to register Admin
	public ResponseEntity<CommonApiResponse> registerAdmin(@Validated(AdminValidationGroup.class) @RequestBody RegisterUserRequestDto request) {
		return userResource.registerAdmin(request);
	}

	// for student and teacher register
	@PostMapping("/register")
	// Api to register customer or seller user
	public ResponseEntity<CommonApiResponse> registerUser(@Validated(UserValidationGroup.class) @RequestBody RegisterUserRequestDto request) {
		return this.userResource.registerUser(request);
	}

	@PostMapping("/register/request-otp")
	public ResponseEntity<RegistrationOtpResponseDto> requestRegistrationOtp(
			@Validated(UserValidationGroup.class) @RequestBody RegisterUserRequestDto request) {
		return this.userResource.requestRegistrationOtp(request);
	}

	@PostMapping("/register/verify-otp")
	public ResponseEntity<CommonApiResponse> verifyRegistrationOtp(@RequestBody VerifyRegistrationOtpRequestDto request) {
		return this.userResource.verifyRegistrationOtp(request);
	}

	@PostMapping("/register/resend-otp")
	public ResponseEntity<RegistrationOtpResponseDto> resendRegistrationOtp(@RequestBody ResendRegistrationOtpRequestDto request) {
		return this.userResource.resendRegistrationOtp(request);
	}

	@PostMapping("login")
	// Api to log in any User
	public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest userLoginRequest) {
		return userResource.login(userLoginRequest);
	}

	@PostMapping("/forgot-password/generate-otp")
	public ResponseEntity<CommonApiResponse> generateForgotPasswordOtp(@RequestBody ForgotPasswordRequestDto request) {
		return userResource.generateForgotPasswordOtp(request);
	}

	@PostMapping("/forgot-password/verify-otp")
	public ResponseEntity<CommonApiResponse> verifyForgotPasswordOtp(@RequestBody ResetPasswordRequestDto request) {
		return userResource.verifyForgotPasswordOtp(request);
	}

	@PostMapping("/forgot-password/reset")
	public ResponseEntity<CommonApiResponse> resetPassword(@RequestBody ResetPasswordRequestDto request) {
		return userResource.resetPassword(request);
	}


	@GetMapping("/fetch/role-wise")
	// Api to get Users By Role
	public ResponseEntity<UserResponseDto> fetchAllUsersByRole(
			@RequestParam("role") String role,
			@RequestParam(value = "status", required = false) String status)
			throws JsonProcessingException {
		return status == null || status.isBlank()
				? userResource.getUsersByRole(role)
				: userResource.getUsersByRoleAndStatus(role, status);
	}

	@PutMapping("update/status")
	// Api to update the user status
	public ResponseEntity<CommonApiResponse> updateUserStatus(@RequestBody UserStatusUpdateRequestDto request) {
		return userResource.updateUserStatus(request);
	}

	@GetMapping("/fetch/user-id")
	// Api to get User Detail By User Id
	public ResponseEntity<UserResponseDto> fetchUserById(@RequestParam("userId") int userId) {
		return userResource.getUserById(userId);
	}

	@GetMapping("/fetch/student/grade-wise")
	// Api to get Students by grade wise
	public ResponseEntity<UserResponseDto> fetchStudentsByGrade(
			@RequestParam("gradeId") int gradeId,
			@RequestParam(value = "teacherId", required = false) Integer teacherId) {
		return userResource.getStudentsByGrade(gradeId, teacherId);
	}

	@DeleteMapping("/delete/user-id")
	// Api to delete the user by ID
	public ResponseEntity<CommonApiResponse> deleteUserById(@RequestParam("userId") int userId) {
		return userResource.deleteUserById(userId);
	}

	@DeleteMapping("/delete/permanent/user-id")
	public ResponseEntity<CommonApiResponse> permanentlyDeleteUserById(@RequestParam("userId") int userId) {
		return userResource.permanentlyDeleteUserById(userId);
	}

	@PostMapping("/upload-profile-picture")
	public ResponseEntity<UploadImageResponseDto> uploadProfileImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
		return userResource.uploadProfileImage(file);
	}

	@PutMapping("/update-profile-picture")
	public ResponseEntity<CommonApiResponse> updateProfilePicture(@RequestBody UpdateProfilePictureRequestDto request) {
		return userResource.updateProfilePicture(request);
	}

}
