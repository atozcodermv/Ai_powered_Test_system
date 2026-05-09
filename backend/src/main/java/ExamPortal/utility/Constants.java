package ExamPortal.utility;

public class Constants {

	public enum UserRole {
		ROLE_STUDENT("Student"), ROLE_ADMIN("Admin"), ROLE_TEACHER("Teacher");

		private String role;

		private UserRole(String role) {
			this.role = role;
		}

		public String value() {
			return this.role;
		}
	}

	public enum ActiveStatus {
		ACTIVE("Active"), DEACTIVATED("Deactivated");

		private String status;

		private ActiveStatus(String status) {
			this.status = status;
		}

		public String value() {
			return this.status;
		}
	}
	
	public enum ExamSubmissionMessage {
	    CONGRATULATIONS_PASS("Congratulations! You have passed the exam. Well done!"),
	    FAILED("Unfortunately, you did not pass the exam."),
	    SUBMITTED("Submitted");

	    private final String message;

	    ExamSubmissionMessage(String message) {
	        this.message = message;
	    }

	    public String value() {
	        return message;
	    }
	}
	
	public enum ExamResultStatus {
	    PASS("Pass"),
	    FAIL("Fail"),
	    PENDING("Pending");

	    private final String status;

	    ExamResultStatus(String status) {
	        this.status = status;
	    }

	    public String value() {
	        return status;
	    }
	}

	public enum ExamType {
		MCQ("MCQ"),
		DESCRIPTIVE("DESCRIPTIVE");

		private final String type;

		ExamType(String type) {
			this.type = type;
		}

		public String value() {
			return type;
		}
	}

	public enum EvaluationStatus {
		PENDING("Pending"),
		EVALUATED("Evaluated");

		private final String status;

		EvaluationStatus(String status) {
			this.status = status;
		}

		public String value() {
			return status;
		}
	}

}
