package ExamPortal.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class PendingRegistration {

	@Id
	private String id;

	private String firstName;

	private String lastName;

	@Column(unique = true)
	private String emailId;

	private String password;

	private String plainPassword;

	private String phoneNo;

	private String role;

	private String street;

	private String city;

	private String pincode;

	private int gradeId;

	private int teacherId;

	private String otpHash;

	private LocalDateTime otpExpiresAt;

	private LocalDateTime resendAllowedAt;

	private int otpSendCount;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	private String publicId;
}
