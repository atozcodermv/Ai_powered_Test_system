package ExamPortal.resource;

import ExamPortal.entities.CommonApiResponse;
import ExamPortal.dto.AssignTeacherToGradeRequestDto;
import ExamPortal.dto.GradeResponseDto;
import ExamPortal.entities.Grade;
import ExamPortal.entities.User;
import ExamPortal.exception.GradeSaveFailedException;
import ExamPortal.services.EmailService;
import ExamPortal.services.GradeService;
import ExamPortal.services.UserService;
import ExamPortal.utility.Constants.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Component
@Transactional
public class GradeResource {

	private final Logger LOG = LoggerFactory.getLogger(GradeResource.class);

	@Autowired
	private GradeService gradeService;

	@Autowired
	private UserService userService;

	@Autowired
	private EmailService emailService;
	
	public ResponseEntity<CommonApiResponse> addGrade(Grade grade) {
		
		LOG.info("Request received for add grade");

		CommonApiResponse response = new CommonApiResponse();

		if (grade == null) {
			response.setResponseMessage("missing input");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User teacher = validateAndFetchTeacher(grade.getTeacherId(), response);
		if (grade.getTeacherId() != 0 && teacher == null) {
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		grade.setTeacher(teacher);
		if (teacher != null) {
			addTeacherIfMissing(grade, teacher);
		}
		grade.setStatus(ActiveStatus.ACTIVE.value());

		Grade savedGrade = this.gradeService.addGrade(grade);

		if (savedGrade == null) {
			throw new GradeSaveFailedException("Failed to add grade");
		}

		sendTeacherAssignmentEmail(teacher, savedGrade);

		response.setResponseMessage("Grade Added Successful");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);

	}
	
    public ResponseEntity<CommonApiResponse> updateGrade(Grade grade) {
		
		LOG.info("Request received for add grade");

		CommonApiResponse response = new CommonApiResponse();

		if (grade == null) {
			response.setResponseMessage("missing input");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (grade.getId() == 0) {
			response.setResponseMessage("missing grade Id");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		Grade existingGrade = this.gradeService.getGradeById(grade.getId());
		if (existingGrade == null) {
			response.setResponseMessage("grade not found");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		existingGrade = normalizeTeacherAssignments(existingGrade);

		User teacher = grade.getTeacherId() == 0
				? existingGrade.getTeacher()
				: validateAndFetchTeacher(grade.getTeacherId(), response);
		if (grade.getTeacherId() != 0 && teacher == null) {
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		grade.setTeacher(teacher);
		grade.setTeachers(existingGrade.getTeachers());
		if (teacher != null) {
			addTeacherIfMissing(grade, teacher);
		}
		grade.setStatus(ActiveStatus.ACTIVE.value());
		Grade savedGrade = this.gradeService.updateGrade(grade);

		if (savedGrade == null) {
			throw new GradeSaveFailedException("Failed to update grade");
		}

		response.setResponseMessage("Grade Updated Successful");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);

	}

	public ResponseEntity<CommonApiResponse> addTeacherToGrade(AssignTeacherToGradeRequestDto request) {

		LOG.info("Request received for adding teacher to grade");

		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getGradeId() == 0 || request.getTeacherId() == 0) {
			response.setResponseMessage("missing input");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		Grade grade = this.gradeService.getGradeById(request.getGradeId());
		if (grade == null) {
			response.setResponseMessage("grade not found");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		grade = normalizeTeacherAssignments(grade);

		User teacher = validateAndFetchTeacher(request.getTeacherId(), response);
		if (teacher == null) {
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (containsTeacher(grade, teacher)) {
			response.setResponseMessage("Teacher already assigned to this grade");
			response.setSuccess(false);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		addTeacherIfMissing(grade, teacher);
		grade.setTeacher(teacher);
		grade.setTeacherId(teacher.getId());
		grade.setStatus(ActiveStatus.ACTIVE.value());

		Grade savedGrade = this.gradeService.updateGrade(grade);

		if (savedGrade == null) {
			throw new GradeSaveFailedException("Failed to add teacher to grade");
		}

		sendTeacherAssignmentEmail(teacher, savedGrade);

		response.setResponseMessage("Teacher added to grade successfully");
		response.setSuccess(true);
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<GradeResponseDto> fetchAllGrade() {

		LOG.info("Request received for fetching all grades");

		GradeResponseDto response = new GradeResponseDto();

		List<Grade> grades = new ArrayList<>();

		grades = this.gradeService.getAllGradesByStatus(ActiveStatus.ACTIVE.value());
		for (Grade grade : grades) {
			normalizeTeacherAssignments(grade);
		}

		if (CollectionUtils.isEmpty(grades)) {
			response.setResponseMessage("No Grades found");
			response.setSuccess(false);

			return new ResponseEntity<GradeResponseDto>(response, HttpStatus.OK);
		}

		response.setGrades(grades);
		response.setResponseMessage("Grade fetched successful");
		response.setSuccess(true);

		return new ResponseEntity<GradeResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> deleteGrade(int gradeId) {

		LOG.info("Request received for deleting grade");

		CommonApiResponse response = new CommonApiResponse();

		if (gradeId == 0) {
			response.setResponseMessage("missing grade Id");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		Grade grade = this.gradeService.getGradeById(gradeId);

		if (grade == null) {
			response.setResponseMessage("grade not found");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}


		grade.setStatus(ActiveStatus.DEACTIVATED.value());
		Grade updatedGrade = this.gradeService.updateGrade(grade);

		if (updatedGrade == null) {
			throw new GradeSaveFailedException("Failed to delete the Grade");
		}

		response.setResponseMessage("Grade Deleted Successful");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);

	}

	private User validateAndFetchTeacher(int teacherId, CommonApiResponse response) {
		if (teacherId == 0) {
			return null;
		}

		User teacher = this.userService.getUserById(teacherId);

		if (teacher == null || !UserRole.ROLE_TEACHER.value().equals(teacher.getRole())) {
			response.setResponseMessage("Teacher not found");
			response.setSuccess(false);
			return null;
		}

		return teacher;
	}

	private Grade normalizeTeacherAssignments(Grade grade) {
		if (grade.getTeachers() == null) {
			grade.setTeachers(new ArrayList<>());
		}

		if (grade.getTeacher() != null && !containsTeacher(grade, grade.getTeacher())) {
			grade.getTeachers().add(grade.getTeacher());
		}

		if (grade.getTeacher() == null && !CollectionUtils.isEmpty(grade.getTeachers())) {
			grade.setTeacher(grade.getTeachers().get(0));
		}

		return grade;
	}

	private void addTeacherIfMissing(Grade grade, User teacher) {
		if (grade.getTeachers() == null) {
			grade.setTeachers(new ArrayList<>());
		}

		if (!containsTeacher(grade, teacher)) {
			grade.getTeachers().add(teacher);
		}
	}

	private boolean containsTeacher(Grade grade, User teacher) {
		if (grade == null || teacher == null || CollectionUtils.isEmpty(grade.getTeachers())) {
			return false;
		}

		return grade.getTeachers().stream().anyMatch(existingTeacher -> existingTeacher.getId() == teacher.getId());
	}

	private void sendTeacherAssignmentEmail(User teacher, Grade grade) {
		if (teacher == null || teacher.getEmailId() == null || teacher.getEmailId().isBlank() || grade == null) {
			return;
		}

		String fullName = ((teacher.getFirstName() != null ? teacher.getFirstName().trim() : "")
				+ " "
				+ (teacher.getLastName() != null ? teacher.getLastName().trim() : "")).trim();

		try {
			this.emailService.sendTeacherGradeAssignmentEmail(
					teacher.getEmailId(),
					fullName,
					grade.getName(),
					grade.getDescription()
			);
		} catch (Exception ex) {
			LOG.error("Grade assignment saved but failed to send email to {}", teacher.getEmailId(), ex);
		}
	}

}
