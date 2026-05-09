package ExamPortal.exception;

import ExamPortal.entities.CommonApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<CommonApiResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
		String responseMessage = ex.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(FieldError::getDefaultMessage)
				.distinct()
				.collect(Collectors.joining(", "));

		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage(responseMessage);
		apiResponse.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<CommonApiResponse> handleConstraintViolationException(ConstraintViolationException ex) {
		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage(ex.getMessage());
		apiResponse.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<CommonApiResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage("Email Id already exists. Please use a different email address.");
		apiResponse.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<CommonApiResponse> handleUserNotFoundException(UserNotFoundException ex) {
		String responseMessage = ex.getMessage();

		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage(responseMessage);
		apiResponse.setSuccess(false);

		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ExceptionHandler(UserSaveFailedException.class)
	public ResponseEntity<CommonApiResponse> handleUserRegistrationFailedException(UserSaveFailedException ex) {
		String responseMessage = ex.getMessage();

		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage(responseMessage);
		apiResponse.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ExceptionHandler(ExamResultSaveFailedException.class)
	public ResponseEntity<CommonApiResponse> handleExamResultSaveFailedException(ExamResultSaveFailedException ex) {
		String responseMessage = ex.getMessage();

		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage(responseMessage);
		apiResponse.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ExceptionHandler(GradeSaveFailedException.class)
	public ResponseEntity<CommonApiResponse> handleGradeSaveFailedException(GradeSaveFailedException ex) {
		String responseMessage = ex.getMessage();

		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage(responseMessage);
		apiResponse.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ExceptionHandler(CourseSaveFailedException.class)
	public ResponseEntity<CommonApiResponse> handleCourseSaveFailedException(CourseSaveFailedException ex) {
		String responseMessage = ex.getMessage();

		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage(responseMessage);
		apiResponse.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ExceptionHandler(ExamSaveFailedException.class)
	public ResponseEntity<CommonApiResponse> handleExamSaveFailedException(ExamSaveFailedException ex) {
		String responseMessage = ex.getMessage();

		CommonApiResponse apiResponse = new CommonApiResponse();
		apiResponse.setResponseMessage(responseMessage);
		apiResponse.setSuccess(false);
		return new ResponseEntity<CommonApiResponse>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);

	}

}
