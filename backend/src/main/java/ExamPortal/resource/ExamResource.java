package ExamPortal.resource;

import ExamPortal.entities.AddExamRequest;
import ExamPortal.entities.CommonApiResponse;
import ExamPortal.dto.ExamResponseDto;
import ExamPortal.entities.*;
import ExamPortal.exception.GradeSaveFailedException;
import ExamPortal.services.*;
import ExamPortal.utility.DateTimeUtils;
import ExamPortal.utility.Constants.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@Transactional
public class ExamResource {

	private final Logger LOG = LoggerFactory.getLogger(ExamResource.class);

	@Autowired
	private CourseService courseService;

	@Autowired
	private UserService userService;

	@Autowired
	private GradeService gradeService;

	@Autowired
	private ExamService examService;

	@Autowired
	private DescriptiveQuestionService descriptiveQuestionService;

	@Autowired
	private ExamResultService examResultService;

	@Autowired
	private EmailService emailService;

	public ResponseEntity<ExamResponseDto> addExam(AddExamRequest request) {

		LOG.info("Request received for add exam");

		ExamResponseDto response = new ExamResponseDto();

		if (request == null || !AddExamRequest.validate(request)) {
			response.setResponseMessage("missing input or bad request");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		User teacher = this.userService.getUserById(request.getTeacherId());

		if (teacher == null) {
			response.setResponseMessage("Teacher not found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		Grade grade = this.gradeService.getGradeById(request.getGradeId());

		if (grade == null) {
			response.setResponseMessage("grade not found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		Course course = this.courseService.getCourseById(request.getCourseId());

		if (course == null) {
			response.setResponseMessage("course not found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		Exam exam = new Exam();
		exam.setAddedDateTime(
				String.valueOf(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()));
		exam.setCourse(course);
		exam.setEndTime(request.getEndTime());
		exam.setGrade(grade);
		exam.setName(request.getName());
		exam.setStartTime(request.getStartTime());
		exam.setDuration(request.getDuration());
		exam.setDescription(request.getDescription());
		exam.setTopic(request.getTopic());
		exam.setExamType(normalizeExamType(request.getExamType()));
		exam.setStatus(ActiveStatus.ACTIVE.value());
		exam.setTeacher(teacher);

		Exam addedExam = this.examService.addExam(exam);

		if (addedExam == null) {
			response.setResponseMessage("Failed to add exam");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		sendExamScheduledEmailToStudents(addedExam);

		response.setExams(Arrays.asList(addedExam));
		response.setResponseMessage("Exam Added Successful");
		response.setSuccess(true);

		return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);

	}

	private void sendExamScheduledEmailToStudents(Exam exam) {
		try {
			List<User> students = getStudentsForGrade(exam.getGrade());
			if (students.isEmpty()) {
				return;
			}

			String examDateTime = DateTimeUtils.getProperDateTimeFormatFromEpochTime(exam.getStartTime());
			for (User student : students) {
				String fullName = ((student.getFirstName() != null ? student.getFirstName().trim() : "")
						+ " "
						+ (student.getLastName() != null ? student.getLastName().trim() : "")).trim();
				this.emailService.sendExamScheduledEmail(
						student.getEmailId(),
						fullName,
						exam.getCourse().getName(),
						exam.getGrade().getName(),
						examDateTime,
						safeValue(exam.getDuration()),
						safeValue(exam.getDescription()),
						safeValue(exam.getTopic()),
						safeValue(exam.getExamType())
				);
			}
		} catch (Exception ex) {
			LOG.error("Exam created but failed to send schedule emails for examId={}", exam.getId(), ex);
		}
	}

	private String safeValue(String value) {
		return value == null || value.isBlank() ? "N/A" : value.trim();
	}

	private String normalizeExamType(String examType) {
		if (ExamType.DESCRIPTIVE.value().equalsIgnoreCase(examType)) {
			return ExamType.DESCRIPTIVE.value();
		}
		return ExamType.MCQ.value();
	}

	private void populateDescriptiveQuestions(List<Exam> exams) {
		for (Exam exam : exams) {
			if (ExamType.DESCRIPTIVE.value().equalsIgnoreCase(exam.getExamType())) {
				exam.setDescriptiveQuestions(this.descriptiveQuestionService.getQuestionsByExam(exam));
			}
		}
	}

	private List<User> getStudentsForGrade(Grade grade) {
		Map<Integer, User> studentsById = new LinkedHashMap<>();
		if (grade == null) {
			return new ArrayList<>();
		}

		List<User> assignedTeachers = getAssignedTeachers(grade);
		for (User assignedTeacher : assignedTeachers) {
			List<User> studentsForTeacher = this.userService.getUsersByRoleAndTeacherAndStatus(
					UserRole.ROLE_STUDENT.value(),
					assignedTeacher,
					ActiveStatus.ACTIVE.value());
			for (User student : studentsForTeacher) {
				studentsById.put(student.getId(), student);
			}
		}

		return new ArrayList<>(studentsById.values());
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

	public ResponseEntity<ExamResponseDto> fetchAllExams() {

		LOG.info("Request received for fetching all exams");

		ExamResponseDto response = new ExamResponseDto();

		List<Exam> exams = new ArrayList<>();

		exams = this.examService.getAllExamsByStatus(ActiveStatus.ACTIVE.value());

		if (CollectionUtils.isEmpty(exams)) {
			response.setResponseMessage("No Exams found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
		}
		
		for (Exam exam : exams) {
			if (!CollectionUtils.isEmpty(exam.getQuestions())) {
				for (Question question : exam.getQuestions()) {
					question.setCorrectAns(question.getCorrectAnswer());
					question.setAnswer(5);
				}
			}
		}

		populateDescriptiveQuestions(exams);

		response.setExams(exams);
		response.setResponseMessage("Exams fetched successful");
		response.setSuccess(true);

		return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<ExamResponseDto> fetchAllExamByGrade(int gradeId) {

		LOG.info("Request received for fetching all exams by Grade");

		ExamResponseDto response = new ExamResponseDto();

		Grade grade = this.gradeService.getGradeById(gradeId);

		if (grade == null) {
			response.setResponseMessage("grade not found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		List<Exam> exams = new ArrayList<>();

		exams = this.examService.getAllExamsByGradeAndStatus(grade, ActiveStatus.ACTIVE.value());

		if (CollectionUtils.isEmpty(exams)) {
			response.setResponseMessage("No Exams found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
		}

		populateDescriptiveQuestions(exams);

		response.setExams(exams);
		response.setResponseMessage("Exams fetched successful");
		response.setSuccess(true);

		return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<ExamResponseDto> fetchAllExambyCourse(int courseId) {

		LOG.info("Request received for fetching all exams by Grade");

		ExamResponseDto response = new ExamResponseDto();

		Course course = this.courseService.getCourseById(courseId);

		if (course == null) {
			response.setResponseMessage("course not found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		List<Exam> exams = new ArrayList<>();

		exams = this.examService.getAllExamsByCourseAndStatus(course, ActiveStatus.ACTIVE.value());

		if (CollectionUtils.isEmpty(exams)) {
			response.setResponseMessage("No Exams found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
		}

		populateDescriptiveQuestions(exams);

		response.setExams(exams);
		response.setResponseMessage("Exams fetched successful");
		response.setSuccess(true);

		return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> deleteExam(int examId) {

		LOG.info("Request received for deleting exam");

		CommonApiResponse response = new CommonApiResponse();

		if (examId == 0) {
			response.setResponseMessage("missing exam Id");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		Exam exam = this.examService.getExamById(examId);

		if (exam == null) {
			response.setResponseMessage("exam not found");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}

		exam.setStatus(ActiveStatus.DEACTIVATED.value());
		Exam updatedExam = this.examService.updateExam(exam);

		if (updatedExam == null) {
			throw new GradeSaveFailedException("Failed to delete the Exam");
		}

		response.setResponseMessage("Exam Deleted Successful");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);

	}

	public ResponseEntity<ExamResponseDto> fetchExamById(int examId) {

		LOG.info("Request received for fetching the exam using exam id");

		ExamResponseDto response = new ExamResponseDto();

		if (examId == 0) {
			response.setResponseMessage("exam not found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		Exam exam = this.examService.getExamById(examId);

		if (exam == null) {
			response.setResponseMessage("No Exam found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
		}

		response.setExams(Arrays.asList(exam));
		populateDescriptiveQuestions(response.getExams());
		response.setResponseMessage("Exams fetched successful");
		response.setSuccess(true);

		return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);

	}

	public ResponseEntity<ExamResponseDto> fetchUpcomingExamsByGrade(int gradeId, String role) {

		LOG.info("Request received for fetching upcoming exams by Grade");

		ExamResponseDto response = new ExamResponseDto();

		Grade grade = this.gradeService.getGradeById(gradeId);

		if (grade == null) {
			response.setResponseMessage("grade not found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		List<Exam> exams = new ArrayList<>();

		String now = String.valueOf(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());

		exams = this.examService.getExamsByGradeAndStartTimeGreaterThanAndStatus(grade, now,
				ActiveStatus.ACTIVE.value());

		if (CollectionUtils.isEmpty(exams)) {
			response.setResponseMessage("No Exams found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
		}

		if (!role.equals(UserRole.ROLE_STUDENT.value())) {
			for (Exam exam : exams) {
				if (!CollectionUtils.isEmpty(exam.getQuestions())) {
					for (Question question : exam.getQuestions()) {
						question.setCorrectAns(question.getCorrectAnswer());
					}
				}
			}
		}
		
		for (Exam exam : exams) {
			if (!CollectionUtils.isEmpty(exam.getQuestions())) {
				for (Question question : exam.getQuestions()) {
					question.setAnswer(5);
				}
			}
		}

		populateDescriptiveQuestions(exams);

		response.setExams(exams);
		response.setResponseMessage("Exams fetched successful");
		response.setSuccess(true);

		return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<ExamResponseDto> fetchPreviousExamsByGrade(int gradeId, String role) {

		LOG.info("Request received for fetching previous exams by Grade");

		ExamResponseDto response = new ExamResponseDto();

		Grade grade = this.gradeService.getGradeById(gradeId);

		if (grade == null) {
			response.setResponseMessage("grade not found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		List<Exam> exams = new ArrayList<>();

		String now = String.valueOf(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());

		exams = this.examService.getExamsByGradeAndStartTimeLessThanAndStatus(grade, now, ActiveStatus.ACTIVE.value());

		if (CollectionUtils.isEmpty(exams)) {
			response.setResponseMessage("No Exams found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
		}
	

		if (!role.equals(UserRole.ROLE_STUDENT.value())) {
			for (Exam exam : exams) {
				if (!CollectionUtils.isEmpty(exam.getQuestions())) {
					for (Question question : exam.getQuestions()) {
						question.setCorrectAns(question.getCorrectAnswer());
					}
				}
			}
		}
		
		for (Exam exam : exams) {
			if (!CollectionUtils.isEmpty(exam.getQuestions())) {
				for (Question question : exam.getQuestions()) {
					question.setAnswer(5);
				}
			}
		}

		populateDescriptiveQuestions(exams);

		response.setExams(exams);
		response.setResponseMessage("Exams fetched successful");
		response.setSuccess(true);

		return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<ExamResponseDto> fetchOngoingExamsByGrade(int gradeId, int studentId, String role) {

		LOG.info("Request received for fetching ongoing exams by Grade");

		ExamResponseDto response = new ExamResponseDto();

		Grade grade = this.gradeService.getGradeById(gradeId);

		if (grade == null || studentId == 0) {
			response.setResponseMessage("missing input");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.BAD_REQUEST);
		}

		List<Exam> exams = new ArrayList<>();

		String now = String.valueOf(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());

		exams = this.examService.getExamsByGradeAndStartTimeLessThanEqualAndEndTimeGreaterThanEqualAndStatus(grade, now,
				now, ActiveStatus.ACTIVE.value());

		if (CollectionUtils.isEmpty(exams)) {
			response.setResponseMessage("No Exams found");
			response.setSuccess(false);

			return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
		}
		
		for (Exam exam : exams) {

			List<ExamResult> results = this.examResultService.getResultsByStudentAndExam(this.userService.getUserById(studentId), exam);

			if(!CollectionUtils.isEmpty(results)) {
				exam.setMessage(ExamSubmissionMessage.SUBMITTED.value());  // that means Student has already submitted the exam and we will not allow him to attempt again
			}
			
		}

		if (!role.equals(UserRole.ROLE_STUDENT.value())) {
			for (Exam exam : exams) {
				if (!CollectionUtils.isEmpty(exam.getQuestions())) {
					for (Question question : exam.getQuestions()) {
						question.setCorrectAns(question.getCorrectAnswer());
					}
				}
			}
		}

		populateDescriptiveQuestions(exams);

		response.setExams(exams);
		response.setResponseMessage("Exams fetched successful");
		response.setSuccess(true);

		return new ResponseEntity<ExamResponseDto>(response, HttpStatus.OK);
	}

}
