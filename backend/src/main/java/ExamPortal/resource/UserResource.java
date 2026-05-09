package ExamPortal.resource;

import ExamPortal.dto.*;
import ExamPortal.entities.*;
import ExamPortal.exception.UserSaveFailedException;
import ExamPortal.repositories.ExamRepository;
import ExamPortal.repositories.ExamResultRepository;
import ExamPortal.repositories.ForgotPasswordSessionRepository;
import ExamPortal.repositories.GradeRepository;
import ExamPortal.repositories.PendingRegistrationRepository;
import ExamPortal.repositories.StudentAnswerRepository;
import ExamPortal.services.AddressService;
import ExamPortal.services.EmailService;
import ExamPortal.services.GradeService;
import ExamPortal.services.UserService;
import ExamPortal.utility.Constants.UserRole;
import ExamPortal.utility.Constants.ActiveStatus;
import ExamPortal.utility.JwtUtils;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@Transactional
public class UserResource {

	private final Logger LOG = LoggerFactory.getLogger(UserResource.class);

	@Autowired
	private UserService userService;

	@Autowired
	private AddressService addressService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtUtils jwtUtils;

	@Autowired
	private GradeService gradeService;

	@Autowired
	private PendingRegistrationRepository pendingRegistrationRepository;

	@Autowired
	private EmailService emailService;

	@Autowired
	private ExamRepository examRepository;

	@Autowired
	private ExamResultRepository examResultRepository;

	@Autowired
	private StudentAnswerRepository studentAnswerRepository;

	@Autowired
	private GradeRepository gradeRepository;

	@Autowired
	private ExamPortal.services.LoginSecurityService loginSecurityService;

	@Autowired
	private ForgotPasswordSessionRepository forgotPasswordSessionRepository;

	@Autowired
	private ExamPortal.services.CloudinaryService cloudinaryService;

	private static final int OTP_EXPIRY_MINUTES = 5;
	private static final int OTP_RESEND_COOLDOWN_SECONDS = 30;
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	public ResponseEntity<CommonApiResponse> registerAdmin(RegisterUserRequestDto registerRequest) {

		LOG.info("Request received for Register Admin");

		CommonApiResponse response = new CommonApiResponse();

		if (registerRequest == null) {
			response.setResponseMessage("User is null");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (registerRequest.getEmailId() == null || registerRequest.getPassword() == null) {
			response.setResponseMessage("Missing input");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User existingUser = this.userService.getUserByEmailid(registerRequest.getEmailId());

		if (existingUser != null) {
			response.setResponseMessage("User already register with this Email");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User user = RegisterUserRequestDto.toUserEntity(registerRequest);

		user.setRole(UserRole.ROLE_ADMIN.value());
		user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
		user.setStatus(ActiveStatus.ACTIVE.value());

		existingUser = this.userService.addUser(user);

		if (existingUser == null) {
			response.setResponseMessage("Failed to register admin");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		response.setResponseMessage("Admin registered Successfully");
		response.setSuccess(true);

		LOG.info("Response Sent!!!");

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> registerUser(RegisterUserRequestDto request) {

		LOG.info("Received request for register user");

		CommonApiResponse response = new CommonApiResponse();
		response.setResponseMessage("Use OTP verification flow to complete registration");
		response.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
	}

	public ResponseEntity<RegistrationOtpResponseDto> requestRegistrationOtp(RegisterUserRequestDto request) {

		LOG.info("Received request for registration OTP");

		RegistrationOtpResponseDto response = new RegistrationOtpResponseDto();

		RegisterUserRequestDto normalizedRequest = validateRegistrationRequest(request, response, true);
		if (normalizedRequest == null) {
			return new ResponseEntity<RegistrationOtpResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		String otp = generateOtp();
		LocalDateTime now = LocalDateTime.now();
		Optional<PendingRegistration> existingPendingRegistration =
				this.pendingRegistrationRepository.findByEmailId(normalizedRequest.getEmailId());

		PendingRegistration pendingRegistration = existingPendingRegistration.orElseGet(PendingRegistration::new);
		pendingRegistration.setId(
				pendingRegistration.getId() != null ? pendingRegistration.getId() : UUID.randomUUID().toString()
		);
		pendingRegistration.setFirstName(normalizedRequest.getFirstName().trim());
		pendingRegistration.setLastName(normalizedRequest.getLastName().trim());
		pendingRegistration.setEmailId(normalizedRequest.getEmailId().trim());
		pendingRegistration.setPassword(passwordEncoder.encode(normalizedRequest.getPassword()));
		pendingRegistration.setPlainPassword(normalizedRequest.getPassword());
		pendingRegistration.setPhoneNo(normalizedRequest.getPhoneNo().trim());
		pendingRegistration.setRole(normalizedRequest.getRole().trim());
		pendingRegistration.setStreet(normalizedRequest.getStreet().trim());
		pendingRegistration.setCity(normalizedRequest.getCity().trim());
		pendingRegistration.setPincode(normalizedRequest.getPincode().trim());
		pendingRegistration.setGradeId(normalizedRequest.getGradeId());
		pendingRegistration.setTeacherId(normalizedRequest.getTeacherId());
		pendingRegistration.setOtpHash(passwordEncoder.encode(otp));
		pendingRegistration.setOtpExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
		pendingRegistration.setResendAllowedAt(now.plusSeconds(OTP_RESEND_COOLDOWN_SECONDS));
		pendingRegistration.setOtpSendCount(pendingRegistration.getOtpSendCount() + 1);
		pendingRegistration.setCreatedAt(
				pendingRegistration.getCreatedAt() != null ? pendingRegistration.getCreatedAt() : now
		);
		pendingRegistration.setUpdatedAt(now);
		pendingRegistration.setPublicId(normalizedRequest.getPublicId());

		this.pendingRegistrationRepository.save(pendingRegistration);
		sendRegistrationOtpEmail(pendingRegistration, otp);

		response.setRegistrationToken(pendingRegistration.getId());
		response.setOtpExpiresInSeconds(OTP_EXPIRY_MINUTES * 60L);
		response.setResendAvailableInSeconds(OTP_RESEND_COOLDOWN_SECONDS);
		response.setResponseMessage("OTP sent to your email address");
		response.setSuccess(true);

		return new ResponseEntity<RegistrationOtpResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<RegistrationOtpResponseDto> resendRegistrationOtp(ResendRegistrationOtpRequestDto request) {

		LOG.info("Received request for resend registration OTP");

		RegistrationOtpResponseDto response = new RegistrationOtpResponseDto();

		if (request == null || request.getRegistrationToken() == null || request.getRegistrationToken().isBlank()) {
			response.setResponseMessage("Registration token is required");
			response.setSuccess(false);
			return new ResponseEntity<RegistrationOtpResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		PendingRegistration pendingRegistration = this.pendingRegistrationRepository
				.findById(request.getRegistrationToken())
				.orElse(null);

		if (pendingRegistration == null) {
			response.setResponseMessage("Registration session expired. Please register again.");
			response.setSuccess(false);
			return new ResponseEntity<RegistrationOtpResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		LocalDateTime now = LocalDateTime.now();
		if (pendingRegistration.getResendAllowedAt() != null && now.isBefore(pendingRegistration.getResendAllowedAt())) {
			response.setResponseMessage("Please wait before requesting a new OTP");
			response.setSuccess(false);
			response.setRegistrationToken(pendingRegistration.getId());
			response.setOtpExpiresInSeconds(getRemainingSeconds(pendingRegistration.getOtpExpiresAt()));
			response.setResendAvailableInSeconds(getRemainingSeconds(pendingRegistration.getResendAllowedAt()));
			return new ResponseEntity<RegistrationOtpResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		RegisterUserRequestDto requestSnapshot = toRegisterUserRequest(pendingRegistration);
		RegisterUserRequestDto normalizedRequest = validateRegistrationRequest(requestSnapshot, response, true);
		if (normalizedRequest == null) {
			return new ResponseEntity<RegistrationOtpResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		String otp = generateOtp();
		pendingRegistration.setOtpHash(passwordEncoder.encode(otp));
		pendingRegistration.setOtpExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
		pendingRegistration.setResendAllowedAt(now.plusSeconds(OTP_RESEND_COOLDOWN_SECONDS));
		pendingRegistration.setOtpSendCount(pendingRegistration.getOtpSendCount() + 1);
		pendingRegistration.setUpdatedAt(now);

		this.pendingRegistrationRepository.save(pendingRegistration);
		sendRegistrationOtpEmail(pendingRegistration, otp);

		response.setRegistrationToken(pendingRegistration.getId());
		response.setOtpExpiresInSeconds(OTP_EXPIRY_MINUTES * 60L);
		response.setResendAvailableInSeconds(OTP_RESEND_COOLDOWN_SECONDS);
		response.setResponseMessage("A new OTP has been sent to your email address");
		response.setSuccess(true);

		return new ResponseEntity<RegistrationOtpResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> verifyRegistrationOtp(VerifyRegistrationOtpRequestDto request) {

		LOG.info("Received request for verify registration OTP");

		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getRegistrationToken() == null || request.getRegistrationToken().isBlank()) {
			response.setResponseMessage("Registration token is required");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (request.getOtp() == null || request.getOtp().isBlank()) {
			response.setResponseMessage("OTP is required");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		PendingRegistration pendingRegistration = this.pendingRegistrationRepository
				.findById(request.getRegistrationToken())
				.orElse(null);

		if (pendingRegistration == null) {
			response.setResponseMessage("Registration session expired. Please register again.");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (pendingRegistration.getOtpExpiresAt() == null || LocalDateTime.now().isAfter(pendingRegistration.getOtpExpiresAt())) {
			response.setResponseMessage("OTP expired. Please request a new OTP.");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (!passwordEncoder.matches(request.getOtp().trim(), pendingRegistration.getOtpHash())) {
			response.setResponseMessage("Invalid OTP, please try again.");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		RegisterUserRequestDto registrationRequest = toRegisterUserRequest(pendingRegistration);
		RegisterUserRequestDto normalizedRequest = validateRegistrationRequest(registrationRequest, response, true);
		if (normalizedRequest == null) {
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User registeredUser = createUserFromPendingRegistration(pendingRegistration, normalizedRequest);
		sendRegistrationSuccessEmail(registeredUser, pendingRegistration);
		this.pendingRegistrationRepository.delete(pendingRegistration);

		response.setResponseMessage("Registration Successful");
		response.setSuccess(true);
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<UserLoginResponse> login(UserLoginRequest loginRequest) {

		LOG.info("Received request for User Login");

		UserLoginResponse response = new UserLoginResponse();

		if (loginRequest == null) {
			response.setResponseMessage("Missing Input");
			response.setSuccess(false);

			return new ResponseEntity<UserLoginResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (loginRequest.getEmailId() == null || loginRequest.getEmailId().isBlank()
				|| loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()
				|| loginRequest.getRole() == null || loginRequest.getRole().isBlank()
				|| "0".equals(loginRequest.getRole().trim())) {
			response.setResponseMessage("Email, password, and role are required.");
			response.setSuccess(false);
			return new ResponseEntity<UserLoginResponse>(response, HttpStatus.BAD_REQUEST);
		}

		String jwtToken = null;
		User user = null;

		String normalizedRole = loginRequest.getRole().trim();
		List<GrantedAuthority> authorities = Arrays.asList(new SimpleGrantedAuthority(normalizedRole));

		// Step 1: Pre-authentication brute force check
		// Only check if user exists under this email and role. Active status matters too.
		user = this.userService.getUserByEmailIdAndRoleAndStatus(loginRequest.getEmailId(), normalizedRole,
				ActiveStatus.ACTIVE.value());

		LoginSecurity loginSecurity = null;
		
		if (user != null) {
			// User exists, fetch security record
			loginSecurity = this.loginSecurityService.getLoginSecurityForUser(user);
			
			// Is Account Locked?
			if (this.loginSecurityService.isAccountLocked(loginSecurity)) {
				response.setResponseMessage(this.loginSecurityService.getLockMessage(loginSecurity));
				response.setSuccess(false);
				return new ResponseEntity<UserLoginResponse>(response, HttpStatus.BAD_REQUEST);
			}
		}

		try {
			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmailId(),
					loginRequest.getPassword(), authorities));
		} catch (Exception ex) {
			
			// Authentication failed
			if (user != null && loginSecurity != null) {
				// Record failure
				loginSecurity = this.loginSecurityService.recordFailedAttempt(loginSecurity);
				
				if (this.loginSecurityService.isAccountLocked(loginSecurity)) {
					response.setResponseMessage(this.loginSecurityService.getLockMessage(loginSecurity));
				} else {
					response.setResponseMessage(this.loginSecurityService.getRemainingAttemptsMessage(loginSecurity));
					// Send security warning email
					if (loginSecurity.getAttemptsCount() == 1) {
						this.emailService.sendLoginSecurityWarningEmail(user.getEmailId());
					}
				}
			} else {
                response.setResponseMessage("Invalid email or password.");
			}
			response.setSuccess(false);
			return new ResponseEntity<UserLoginResponse>(response, HttpStatus.BAD_REQUEST);
		}


		jwtToken = jwtUtils.generateToken(loginRequest.getEmailId());

		// user is authenticated, and user cannot be null here because AuthenticationManager passed, 
		// but check anyway.
		if (user == null) {
			response.setResponseMessage("User not found.");
			response.setSuccess(false);
			return new ResponseEntity<UserLoginResponse>(response, HttpStatus.BAD_REQUEST);
		}

		// Reset Security on Success
		if (loginSecurity != null) {
			this.loginSecurityService.resetLoginSecurity(loginSecurity);
		}

		UserDto userDto = toUserDto(user);

		// return response
		if (jwtToken != null) {
			response.setUser(userDto);
			response.setResponseMessage("Logged in successful");
			response.setSuccess(true);
			response.setJwtToken(jwtToken);
			return new ResponseEntity<UserLoginResponse>(response, HttpStatus.OK);
		}

		else {
			response.setResponseMessage("Failed to login");
			response.setSuccess(false);
			return new ResponseEntity<UserLoginResponse>(response, HttpStatus.BAD_REQUEST);
		}

	}

	public ResponseEntity<CommonApiResponse> generateForgotPasswordOtp(ForgotPasswordRequestDto request) {
		LOG.info("Received request for Forgot Password OTP Generation");
		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
			response.setResponseMessage("Email is required");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		User user = this.userService.getUserByEmailid(request.getEmail().trim());
		if (user == null || !ActiveStatus.ACTIVE.value().equalsIgnoreCase(user.getStatus())) {
			response.setResponseMessage("You are not a registered user of Smart Exam. Please go to the registration page and create an account.");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		String otp = generateOtp();
		ForgotPasswordSession session = this.forgotPasswordSessionRepository
				.findByEmailIgnoreCase(request.getEmail().trim())
				.orElseGet(ForgotPasswordSession::new);

		session.setId(session.getId() != null ? session.getId() : UUID.randomUUID().toString());
		session.setEmail(request.getEmail().trim());
		session.setOtpHash(passwordEncoder.encode(otp));
		session.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));

		this.forgotPasswordSessionRepository.save(session);
		this.emailService.sendForgotPasswordOtpEmail(user.getEmailId(), otp);

		response.setResponseMessage("OTP sent successfully to your registered email address.");
		response.setSuccess(true);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> verifyForgotPasswordOtp(ResetPasswordRequestDto request) {
		LOG.info("Received request for Forgot Password OTP Verification");
		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getEmail() == null || request.getOtp() == null) {
			response.setResponseMessage("Email and OTP are required");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		ForgotPasswordSession session = this.forgotPasswordSessionRepository
				.findByEmailIgnoreCase(request.getEmail().trim())
				.orElse(null);

		if (session == null || session.getExpiryTime().isBefore(LocalDateTime.now())) {
			response.setResponseMessage("OTP expired or invalid session. Please request a new OTP.");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		if (!passwordEncoder.matches(request.getOtp().trim(), session.getOtpHash())) {
			response.setResponseMessage("Invalid OTP. Please try again.");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		response.setResponseMessage("OTP verified successfully.");
		response.setSuccess(true);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> resetPassword(ResetPasswordRequestDto request) {
		LOG.info("Received request for Password Reset");
		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getEmail() == null || request.getOtp() == null || request.getNewPassword() == null) {
			response.setResponseMessage("Missing required fields for password reset.");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		ForgotPasswordSession session = this.forgotPasswordSessionRepository
				.findByEmailIgnoreCase(request.getEmail().trim())
				.orElse(null);

		if (session == null || session.getExpiryTime().isBefore(LocalDateTime.now())) {
			response.setResponseMessage("OTP expired. Please request a new OTP.");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		if (!passwordEncoder.matches(request.getOtp().trim(), session.getOtpHash())) {
			response.setResponseMessage("Invalid OTP. Please try again.");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		User user = this.userService.getUserByEmailid(request.getEmail().trim());
		if (user == null) {
			response.setResponseMessage("User not found.");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
			response.setResponseMessage("current password is not same as previous password ");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		this.userService.updateUser(user);
		this.forgotPasswordSessionRepository.delete(session);

		LoginSecurity loginSecurity = this.loginSecurityService.getLoginSecurityForUser(user);
		if (loginSecurity != null) {
			this.loginSecurityService.resetLoginSecurity(loginSecurity);
		}

		response.setResponseMessage("Password reset successful. You can now login.");
		response.setSuccess(true);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	public ResponseEntity<UserResponseDto> getUsersByRole(String role) {
		return getUsersByRoleAndStatus(role, ActiveStatus.ACTIVE.value());
	}

	public ResponseEntity<UserResponseDto> getUsersByRoleAndStatus(String role, String status) {

		UserResponseDto response = new UserResponseDto();

		if (role == null || role.isBlank()) {
			response.setResponseMessage("Missing role");
			response.setSuccess(false);
			return new ResponseEntity<UserResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		if (status == null || status.isBlank()) {
			response.setResponseMessage("Missing status");
			response.setSuccess(false);
			return new ResponseEntity<UserResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		List<User> users = new ArrayList<>();

		users = this.userService.getUserByRoleAndStatus(role, status);

		if (users.isEmpty()) {
			response.setResponseMessage("No Users Found");
			response.setSuccess(false);
		}

		List<UserDto> userDtos = new ArrayList<>();

		for (User user : users) {

			UserDto dto = toUserDto(user);

			userDtos.add(dto);

		}

		response.setUsers(userDtos);
		response.setResponseMessage("User Fetched Successfully");
		response.setSuccess(true);

		return new ResponseEntity<UserResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> updateUserStatus(UserStatusUpdateRequestDto request) {

		LOG.info("Received request for updating the user status");

		CommonApiResponse response = new CommonApiResponse();

		if (request == null) {
			response.setResponseMessage("Bad request, missing data");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (request.getUserId() == 0) {
			response.setResponseMessage("Bad request, User id is missing");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User user = null;
		user = this.userService.getUserById(request.getUserId());

		user.setStatus(request.getStatus());

		User updatedUser = this.userService.updateUser(user);

		if (updatedUser == null) {
			throw new UserSaveFailedException("Failed to update the User status");
		}

		response.setResponseMessage("User " + request.getStatus() + " Successfully!!!");
		response.setSuccess(true);
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);

	}

	public ResponseEntity<UserResponseDto> getUserById(int userId) {

		UserResponseDto response = new UserResponseDto();

		if (userId == 0) {
			response.setResponseMessage("Invalid Input");
			response.setSuccess(false);
			return new ResponseEntity<UserResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		List<User> users = new ArrayList<>();

		User user = this.userService.getUserById(userId);
		users.add(user);

		if (users.isEmpty()) {
			response.setResponseMessage("No Users Found");
			response.setSuccess(false);
			return new ResponseEntity<UserResponseDto>(response, HttpStatus.OK);
		}

		List<UserDto> userDtos = new ArrayList<>();

		for (User u : users) {

			UserDto dto = toUserDto(u);

			userDtos.add(dto);

		}

		response.setUsers(userDtos);
		response.setResponseMessage("User Fetched Successfully");
		response.setSuccess(true);

		return new ResponseEntity<UserResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<UserResponseDto> getStudentsByGrade(int gradeId, Integer teacherId) {

		UserResponseDto response = new UserResponseDto();

		if (gradeId == 0) {
			response.setResponseMessage("Grade missing");
			response.setSuccess(false);
			return new ResponseEntity<UserResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		Grade grade = this.gradeService.getGradeById(gradeId);

		if (grade == null) {
			response.setResponseMessage("Grade not found");
			response.setSuccess(false);
			return new ResponseEntity<UserResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		List<User> assignedTeachers = getAssignedTeachers(grade);
		if (assignedTeachers.isEmpty()) {
			response.setResponseMessage("No teacher assigned to selected grade");
			response.setSuccess(false);
			return new ResponseEntity<UserResponseDto>(response, HttpStatus.OK);
		}

		if (teacherId != null && teacherId != 0) {
			User selectedTeacher = this.userService.getUserById(teacherId);
			if (selectedTeacher == null || !UserRole.ROLE_TEACHER.value().equals(selectedTeacher.getRole())) {
				response.setResponseMessage("Teacher not found");
				response.setSuccess(false);
				return new ResponseEntity<UserResponseDto>(response, HttpStatus.BAD_REQUEST);
			}

			boolean teacherAssignedToGrade = assignedTeachers.stream()
					.anyMatch(assignedTeacher -> assignedTeacher.getId() == teacherId);
			if (!teacherAssignedToGrade) {
				response.setResponseMessage("Teacher is not assigned to the selected grade");
				response.setSuccess(false);
				return new ResponseEntity<UserResponseDto>(response, HttpStatus.BAD_REQUEST);
			}

			assignedTeachers = new ArrayList<>(List.of(selectedTeacher));
		}

		Map<Integer, User> studentsById = new LinkedHashMap<>();
		for (User assignedTeacher : assignedTeachers) {
			List<User> studentsForTeacher = this.userService.getUsersByRoleAndTeacherAndStatus(
					UserRole.ROLE_STUDENT.value(),
					assignedTeacher,
					ActiveStatus.ACTIVE.value());
			for (User student : studentsForTeacher) {
				studentsById.put(student.getId(), student);
			}
		}

		List<User> users = new ArrayList<>(studentsById.values());

		if (users.isEmpty()) {
			response.setResponseMessage("No Students Found");
			response.setSuccess(false);
			return new ResponseEntity<UserResponseDto>(response, HttpStatus.OK);
		}

		List<UserDto> userDtos = new ArrayList<>();

		for (User u : users) {

			UserDto dto = toUserDto(u);

			userDtos.add(dto);

		}

		response.setUsers(userDtos);
		response.setResponseMessage("Students Fetched Successfully");
		response.setSuccess(true);

		return new ResponseEntity<UserResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> deleteUserById(int userId) {

		CommonApiResponse response = new CommonApiResponse();

		if (userId == 0) {
			response.setResponseMessage("User id missing");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User user = this.userService.getUserById(userId);

		if (user == null) {
			response.setResponseMessage("User not found");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (UserRole.ROLE_TEACHER.value().equals(user.getRole())) {
			List<User> students = this.userService.getUsersByRoleAndTeacherAndStatus(
					UserRole.ROLE_STUDENT.value(),
					user,
					ActiveStatus.ACTIVE.value());

			for (User student : students) {
				student.setStatus(ActiveStatus.DEACTIVATED.value());
			}

			if (!students.isEmpty()) {
				this.userService.updateAllUser(students);
			}

			List<Grade> grades = this.gradeService.getGradesByTeacherAndStatus(user, ActiveStatus.ACTIVE.value());
			for (Grade grade : grades) {
				if (grade.getTeachers() != null) {
					grade.getTeachers().removeIf(assignedTeacher -> assignedTeacher.getId() == user.getId());
				}

				if (grade.getTeacher() != null && grade.getTeacher().getId() == user.getId()) {
					grade.setTeacher(
							grade.getTeachers() != null && !grade.getTeachers().isEmpty()
									? grade.getTeachers().get(0)
									: null
					);
				}

				grade.setTeacherId(grade.getTeacher() != null ? grade.getTeacher().getId() : 0);
				this.gradeService.updateGrade(grade);
			}
		}
		
		user.setStatus(ActiveStatus.DEACTIVATED.value());
		
		User updatedUser = this.userService.updateUser(user);

		if(updatedUser == null) {
			response.setResponseMessage("Failed to Delete the User");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		
		response.setResponseMessage("User Deactivated Successfully!!");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> permanentlyDeleteUserById(int userId) {

		CommonApiResponse response = new CommonApiResponse();

		if (userId == 0) {
			response.setResponseMessage("User id missing");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User user = this.userService.getUserById(userId);
		if (user == null) {
			response.setResponseMessage("User not found");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (!ActiveStatus.DEACTIVATED.value().equals(user.getStatus())) {
			response.setResponseMessage("Only deactivated users can be permanently deleted");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (UserRole.ROLE_TEACHER.value().equals(user.getRole())) {
			if (!this.examRepository.findByTeacher(user).isEmpty()) {
				response.setResponseMessage("Cannot permanently delete teacher with exam history");
				response.setSuccess(false);
				return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
			}

			List<User> assignedStudents = this.userService.getUsersByRoleAndTeacher(UserRole.ROLE_STUDENT.value(), user);
			for (User student : assignedStudents) {
				student.setTeacher(null);
			}
			if (!assignedStudents.isEmpty()) {
				this.userService.updateAllUser(assignedStudents);
			}

			for (Grade grade : this.gradeRepository.findByTeachersContaining(user)) {
				if (grade.getTeachers() != null) {
					grade.getTeachers().removeIf(assignedTeacher -> assignedTeacher.getId() == user.getId());
				}
				grade.setTeacher(grade.getTeachers() != null && !grade.getTeachers().isEmpty() ? grade.getTeachers().get(0) : null);
				grade.setTeacherId(grade.getTeacher() != null ? grade.getTeacher().getId() : 0);
				this.gradeService.updateGrade(grade);
			}
		}

		if (UserRole.ROLE_STUDENT.value().equals(user.getRole())) {
			if (!this.examResultRepository.findByStudent(user).isEmpty()
					|| !this.studentAnswerRepository.findByStudent(user).isEmpty()) {
				response.setResponseMessage("Cannot permanently delete student with exam history");
				response.setSuccess(false);
				return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
			}
		}

		this.userService.deleteUser(user);
		response.setResponseMessage("User Permanently Deleted Successfully!!");
		response.setSuccess(true);
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	private UserDto toUserDto(User user) {
		Grade grade = null;

		if (user != null) {
			if (UserRole.ROLE_TEACHER.value().equals(user.getRole())) {
				List<Grade> grades = this.gradeService.getGradesByTeacherAndStatus(user, ActiveStatus.ACTIVE.value());
				if (!grades.isEmpty()) {
					grade = grades.get(0);
				}
			} else if (user.getTeacher() != null) {
				List<Grade> grades = this.gradeService.getGradesByTeacherAndStatus(user.getTeacher(), ActiveStatus.ACTIVE.value());
				if (!grades.isEmpty()) {
					grade = grades.get(0);
				}
			}
		}

		return UserDto.toUserDtoEntity(user, grade);
	}

	private RegisterUserRequestDto validateRegistrationRequest(
			RegisterUserRequestDto request,
			CommonApiResponse response,
			boolean ensureEmailNotRegistered) {

		if (request == null) {
			response.setResponseMessage("User is null");
			response.setSuccess(false);
			return null;
		}

		if (request.getRole() == null) {
			response.setResponseMessage("Bad request, Role is missing");
			response.setSuccess(false);
			return null;
		}

		if (ensureEmailNotRegistered) {
			User existingUser = this.userService.getUserByEmailid(request.getEmailId());
			if (existingUser != null) {
				response.setResponseMessage("User with this Email Id already registered!!!");
				response.setSuccess(false);
				return null;
			}
		}

		if (request.getRole().equals(UserRole.ROLE_STUDENT.value())) {
			if (request.getGradeId() == 0) {
				response.setResponseMessage("Bad request, Grade Id missing");
				response.setSuccess(false);
				return null;
			}

			Grade grade = this.gradeService.getGradeById(request.getGradeId());
			if (grade == null) {
				response.setResponseMessage("Bad request, Grade Id missing");
				response.setSuccess(false);
				return null;
			}

			List<User> assignedTeachers = getAssignedTeachers(grade);
			if (assignedTeachers.isEmpty()) {
				response.setResponseMessage("Bad request, selected grade has no teacher assigned");
				response.setSuccess(false);
				return null;
			}

			User selectedTeacher = null;
			if (request.getTeacherId() == 0) {
				selectedTeacher = assignedTeachers.get(0);
			} else {
				for (User assignedTeacher : assignedTeachers) {
					if (assignedTeacher.getId() == request.getTeacherId()) {
						selectedTeacher = assignedTeacher;
						break;
					}
				}
			}

			if (selectedTeacher == null || !selectedTeacher.getRole().equals(UserRole.ROLE_TEACHER.value())) {
				response.setResponseMessage("Bad request, Teacher does not belong to selected grade");
				response.setSuccess(false);
				return null;
			}

			request.setTeacherId(selectedTeacher.getId());
		} else {
			request.setGradeId(0);
			request.setTeacherId(0);
		}

		return request;
	}

	private User createUserFromRegistrationRequest(RegisterUserRequestDto request) {
		User user = RegisterUserRequestDto.toUserEntity(request);
		User teacher = null;

		if (request.getRole().equals(UserRole.ROLE_STUDENT.value())) {
			Grade grade = this.gradeService.getGradeById(request.getGradeId());
			List<User> assignedTeachers = getAssignedTeachers(grade);

			for (User assignedTeacher : assignedTeachers) {
				if (assignedTeacher.getId() == request.getTeacherId()) {
					teacher = assignedTeacher;
					break;
				}
			}

			user.setTeacher(teacher);
		}

		user.setStatus(ActiveStatus.ACTIVE.value());
		user.setPassword(passwordEncoder.encode(user.getPassword()));

		Address address = new Address();
		address.setCity(request.getCity());
		address.setPincode(Integer.parseInt(request.getPincode()));
		address.setStreet(request.getStreet());

		Address savedAddress = this.addressService.addAddress(address);
		if (savedAddress == null) {
			throw new UserSaveFailedException("Registration Failed because of Technical issue:(");
		}

		user.setAddress(savedAddress);

		User savedUser = this.userService.addUser(user);
		if (savedUser == null) {
			throw new UserSaveFailedException("Registration Failed because of Technical issue:(");
		}

		return savedUser;
	}

	private User createUserFromPendingRegistration(PendingRegistration pendingRegistration, RegisterUserRequestDto request) {
		User user = RegisterUserRequestDto.toUserEntity(request);
		User teacher = null;

		if (request.getRole().equals(UserRole.ROLE_STUDENT.value())) {
			Grade grade = this.gradeService.getGradeById(request.getGradeId());
			List<User> assignedTeachers = getAssignedTeachers(grade);

			for (User assignedTeacher : assignedTeachers) {
				if (assignedTeacher.getId() == request.getTeacherId()) {
					teacher = assignedTeacher;
					break;
				}
			}

			user.setTeacher(teacher);
		}

		user.setStatus(ActiveStatus.ACTIVE.value());
		user.setPassword(pendingRegistration.getPassword());

		Address address = new Address();
		address.setCity(request.getCity());
		address.setPincode(Integer.parseInt(request.getPincode()));
		address.setStreet(request.getStreet());

		Address savedAddress = this.addressService.addAddress(address);
		if (savedAddress == null) {
			throw new UserSaveFailedException("Registration Failed because of Technical issue:(");
		}

		user.setAddress(savedAddress);

		User savedUser = this.userService.addUser(user);
		if (savedUser == null) {
			throw new UserSaveFailedException("Registration Failed because of Technical issue:(");
		}

		return savedUser;
	}

	private RegisterUserRequestDto toRegisterUserRequest(PendingRegistration pendingRegistration) {
		RegisterUserRequestDto request = new RegisterUserRequestDto();
		request.setFirstName(pendingRegistration.getFirstName());
		request.setLastName(pendingRegistration.getLastName());
		request.setEmailId(pendingRegistration.getEmailId());
		request.setPassword("OtpPass1!");
		request.setPhoneNo(pendingRegistration.getPhoneNo());
		request.setRole(pendingRegistration.getRole());
		request.setStreet(pendingRegistration.getStreet());
		request.setCity(pendingRegistration.getCity());
		request.setPincode(pendingRegistration.getPincode());
		request.setGradeId(pendingRegistration.getGradeId());
		request.setTeacherId(pendingRegistration.getTeacherId());
		request.setPublicId(pendingRegistration.getPublicId());
		return request;
	}

	private void sendRegistrationOtpEmail(PendingRegistration pendingRegistration, String otp) {
		String body = "<div style='font-family:Arial,sans-serif;color:#222'>"
				+ "<h2>Email Verification</h2>"
				+ "<p>Your registration OTP is:</p>"
				+ "<div style='font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0;'>"
				+ otp
				+ "</div>"
				+ "<p>This OTP will expire in " + OTP_EXPIRY_MINUTES + " minutes.</p>"
				+ "<p>If you did not request this, you can ignore this email.</p>"
				+ "</div>";

		this.emailService.sendEmail(
				pendingRegistration.getEmailId(),
				"Smart Exam Portal Registration OTP",
				body
		);
	}

	private void sendRegistrationSuccessEmail(User registeredUser, PendingRegistration pendingRegistration) {
		try {
			String fullName = ((registeredUser.getFirstName() != null ? registeredUser.getFirstName().trim() : "")
					+ " "
					+ (registeredUser.getLastName() != null ? registeredUser.getLastName().trim() : "")).trim();

			this.emailService.sendRegistrationSuccessEmail(
					registeredUser.getEmailId(),
					fullName,
					registeredUser.getEmailId(),
					pendingRegistration.getPlainPassword(),
					registeredUser.getRole()
			);
		} catch (Exception ex) {
			LOG.error("Registration completed but failed to send success email to {}", registeredUser.getEmailId(), ex);
		}
	}

	private String generateOtp() {
		return String.valueOf(100000 + SECURE_RANDOM.nextInt(900000));
	}

	private long getRemainingSeconds(LocalDateTime targetTime) {
		if (targetTime == null) {
			return 0;
		}

		long seconds = Duration.between(LocalDateTime.now(), targetTime).getSeconds();
		return Math.max(seconds, 0);
	}

	private User resolvePrimaryTeacher(Grade grade) {
		if (grade == null) {
			return null;
		}

		if (grade.getTeacher() != null) {
			return grade.getTeacher();
		}

		if (grade.getTeachers() != null && !grade.getTeachers().isEmpty()) {
			return grade.getTeachers().get(0);
		}

		return null;
	}

	private List<User> getAssignedTeachers(Grade grade) {
		Map<Integer, User> teachersById = new LinkedHashMap<>();

		if (grade == null) {
			return new ArrayList<>();
		}

		if (grade.getTeachers() != null) {
			for (User teacher : grade.getTeachers()) {
				teachersById.put(teacher.getId(), teacher);
			}
		}

		if (grade.getTeacher() != null) {
			teachersById.put(grade.getTeacher().getId(), grade.getTeacher());
		}

		return new ArrayList<>(teachersById.values());
	}

<<<<<<< HEAD
=======
	public ResponseEntity<UploadImageResponseDto> uploadProfileImage(org.springframework.web.multipart.MultipartFile file) {
		UploadImageResponseDto response = new UploadImageResponseDto();
		
		if (file == null || file.isEmpty()) {
			response.setSuccess(false);
			response.setResponseMessage("No file uploaded.");
			return new ResponseEntity<UploadImageResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		// Server-side Validation: File Size (2MB)
		if (file.getSize() > 2 * 1024 * 1024) {
			response.setSuccess(false);
			response.setResponseMessage("File size exceeds 2MB limit.");
			return new ResponseEntity<UploadImageResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		// Server-side Validation: File Type
		String contentType = file.getContentType();
		if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/webp"))) {
			response.setSuccess(false);
			response.setResponseMessage("Invalid file type. Only JPEG, PNG, and WEBP are allowed.");
			return new ResponseEntity<UploadImageResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		try {
			String publicId = cloudinaryService.uploadImage(file);
			response.setSuccess(true);
			response.setPublicId(publicId);
			response.setResponseMessage("Image uploaded successfully");
			return new ResponseEntity<UploadImageResponseDto>(response, HttpStatus.OK);
		} catch (Exception e) {
			LOG.error("Failed to upload image", e);
			response.setSuccess(false);
			response.setResponseMessage("Failed to upload image: " + e.getMessage());
			return new ResponseEntity<UploadImageResponseDto>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<CommonApiResponse> updateProfilePicture(UpdateProfilePictureRequestDto request) {
		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getUserId() == 0 || request.getPublicId() == null || request.getPublicId().trim().isEmpty()) {
			response.setSuccess(false);
			response.setResponseMessage("Missing user id or profile picture ID.");
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
		User user = userService.getUserById(request.getUserId());
		if (user == null) {
			response.setSuccess(false);
			response.setResponseMessage("User not found.");
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
		user.setPublicId(request.getPublicId());
		userService.updateUser(user);
		
		response.setSuccess(true);
		response.setResponseMessage("Profile picture updated successfully.");
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

>>>>>>> 722e9e9 (profile pic upload feature added)
}
