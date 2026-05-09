package ExamPortal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyRegistrationOtpRequestDto {

	private String registrationToken;

	private String otp;

}
