package ExamPortal.dto;

import ExamPortal.entities.CommonApiResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationOtpResponseDto extends CommonApiResponse {

	private String registrationToken;

	private long otpExpiresInSeconds;

	private long resendAvailableInSeconds;

}
