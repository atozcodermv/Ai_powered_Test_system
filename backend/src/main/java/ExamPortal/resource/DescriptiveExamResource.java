package ExamPortal.resource;

import ExamPortal.entities.*;
import ExamPortal.services.DescriptiveAnswerService;
import ExamPortal.services.DescriptiveQuestionService;
import ExamPortal.services.ExamResultService;
import ExamPortal.services.ExamService;
import ExamPortal.services.UserService;
import ExamPortal.services.AiQuestionGenerationService;
import ExamPortal.utility.Constants;
import ExamPortal.dto.AiEvaluationRequestDto;
import ExamPortal.dto.AiEvaluationResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Transactional
public class DescriptiveExamResource {

    private final Logger log = LoggerFactory.getLogger(DescriptiveExamResource.class);

    @Autowired
    private ExamService examService;

    @Autowired
    private UserService userService;

    @Autowired
    private DescriptiveQuestionService descriptiveQuestionService;

    @Autowired
    private DescriptiveAnswerService descriptiveAnswerService;

    @Autowired
    private ExamResultService examResultService;

    @Autowired
    private ExamPortal.services.EmailService emailService;

    @Autowired
    private AiQuestionGenerationService aiQuestionGenerationService;
    
    @Autowired
    private ExamPortal.dao.ExamCheatingDao examCheatingDao;

    @org.springframework.beans.factory.annotation.Value("${com.examportal.universityName}")
    private String universityName;

    public ResponseEntity<DescriptiveQuestionResponse> addQuestions(DescriptiveQuestionRequest request) {
        DescriptiveQuestionResponse response = new DescriptiveQuestionResponse();

        if (!DescriptiveQuestionRequest.validate(request)) {
            response.setSuccess(false);
            response.setResponseMessage("missing input or bad request");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Exam exam = examService.getExamById(request.getExamId());
        if (exam == null) {
            response.setSuccess(false);
            response.setResponseMessage("Exam not found");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        if (!Constants.ExamType.DESCRIPTIVE.value().equalsIgnoreCase(exam.getExamType())) {
            response.setSuccess(false);
            response.setResponseMessage("Questions can be added here only for descriptive exams");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        String now = now();
        List<DescriptiveQuestion> questions = new ArrayList<>();
        for (DescriptiveQuestionRequest.DescriptiveQuestionPayload payload : request.getQuestions()) {
            DescriptiveQuestion question = new DescriptiveQuestion();
            question.setExam(exam);
            question.setQuestionContent(payload.getQuestionContent().trim());
            question.setTotalMarks(payload.getTotalMarks());
            question.setCreatedTime(now);
            question.setUpdatedTime(now);
            questions.add(question);
        }

        List<DescriptiveQuestion> savedQuestions = descriptiveQuestionService.addQuestions(questions);

        exam.setDescriptiveQuestions(descriptiveQuestionService.getQuestionsByExam(exam));

        response.setQuestions(savedQuestions);
        response.setSuccess(true);
        response.setResponseMessage("Descriptive questions saved successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<DescriptiveQuestionResponse> fetchQuestionsByExam(int examId, int studentId) {
        DescriptiveQuestionResponse response = new DescriptiveQuestionResponse();

        Exam exam = examService.getExamById(examId);
        if (exam == null) {
            response.setSuccess(false);
            response.setResponseMessage("Exam not found");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        List<DescriptiveQuestion> questions = descriptiveQuestionService.getQuestionsByExam(exam);
        if (studentId > 0) {
            List<DescriptiveAnswer> answers = descriptiveAnswerService.getAnswersByExamAndStudent(examId, studentId);
            Map<Integer, DescriptiveAnswer> answerByQuestionId = answers.stream()
                    .collect(Collectors.toMap(answer -> answer.getQuestion().getId(), answer -> answer, (left, right) -> left));
            for (DescriptiveQuestion question : questions) {
                DescriptiveAnswer answer = answerByQuestionId.get(question.getId());
                if (answer != null) {
                    question.setAnswerContent(answer.getAnswerContent());
                    question.setAwardedScore(answer.getScore());
                    question.setEvaluationStatus(answer.getEvaluationStatus());
                }
            }
        }

        response.setQuestions(questions);
        response.setSuccess(true);
        response.setResponseMessage("Descriptive questions fetched successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<CommonApiResponse> submitAnswers(DescriptiveAnswerSubmissionRequest request) {
        CommonApiResponse response = new CommonApiResponse();

        if (!DescriptiveAnswerSubmissionRequest.validate(request)) {
            response.setSuccess(false);
            response.setResponseMessage("missing input or bad request");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Exam exam = examService.getExamById(request.getExamId());
        User student = userService.getUserById(request.getStudentId());
        if (exam == null || student == null) {
            response.setSuccess(false);
            response.setResponseMessage("Exam or student not found");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        List<ExamResult> existingResults = examResultService.getResultsByStudentAndExam(student, exam);
        if (!CollectionUtils.isEmpty(existingResults)) {
            response.setSuccess(false);
            response.setResponseMessage("This exam has already been submitted");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        String submittedAt = now();
        List<DescriptiveAnswer> answers = new ArrayList<>();
        double totalMarks = 0;
        for (DescriptiveAnswerSubmissionRequest.DescriptiveAnswerPayload payload : request.getAnswers()) {
            DescriptiveQuestion question = descriptiveQuestionService.getQuestionById(payload.getQuestionId());
            if (question == null || question.getExam().getId() != exam.getId()) {
                response.setSuccess(false);
                response.setResponseMessage("Question not found for this exam");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            DescriptiveAnswer answer = new DescriptiveAnswer();
            answer.setQuestion(question);
            answer.setStudent(student);
            answer.setAnswerContent(payload.getAnswerContent().trim());
            answer.setScore(0.0);
            answer.setEvaluationStatus(Constants.EvaluationStatus.PENDING.value());
            answer.setSubmitTime(submittedAt);
            answers.add(answer);
            totalMarks += question.getTotalMarks();
        }

        descriptiveAnswerService.saveAll(answers);

        ExamResult result = new ExamResult();
        result.setExam(exam);
        result.setStudent(student);
        result.setTotalQuestions(answers.size());
        result.setTotalMarks(totalMarks);
        result.setTotalCorrectAnswers(0);
        result.setTotalWrongAnswers(0);
        result.setScore(0);
        result.setPercentage(0);
        result.setResultStatus(Constants.ExamResultStatus.PENDING.value());
        result.setEvaluationStatus(Constants.EvaluationStatus.PENDING.value());
        result.setDateTime(submittedAt);
        examResultService.addResult(result);
        
        // Handle Cheating Logging
		if (request.isAutoSubmit() && request.getViolationReason() != null && !request.getViolationReason().isEmpty()) {
		    ExamCheating cheatingLog = new ExamCheating();
		    cheatingLog.setStudent(student);
		    cheatingLog.setExam(exam);
		    
		    User teacher = exam.getTeacher();
		    if (teacher == null && exam.getGrade() != null) {
		        teacher = exam.getGrade().getTeacher();
		    }
		    
		    cheatingLog.setTeacher(teacher);
		    cheatingLog.setViolationReason(request.getViolationReason());
		    cheatingLog.setTimestamp(submittedAt);
		    examCheatingDao.save(cheatingLog);
		    
		    // Send Email to Teacher
		    if (teacher != null && teacher.getEmailId() != null) {
		        try {
		            this.emailService.sendCheatingNotificationEmail(
		                teacher.getEmailId(),
		                teacher.getFirstName() + " " + teacher.getLastName(),
		                student.getFirstName() + " " + student.getLastName(),
		                String.valueOf(student.getId()),
		                exam.getName(),
		                request.getViolationReason(),
		                ExamPortal.utility.DateTimeUtils.getProperDateTimeFormatFromEpochTime(submittedAt)
		            );
		        } catch (Exception e) {
		            log.error("Failed to send cheating notification mail to teacher: " + teacher.getEmailId(), e);
		        }
		    }
		}

        response.setSuccess(true);
        if (request.isAutoSubmit() && request.getViolationReason() != null && !request.getViolationReason().isEmpty()) {
		    response.setResponseMessage("Descriptive Exam Auto-Submitted Details Saved due to: " + request.getViolationReason());
		} else {
            response.setResponseMessage("Descriptive exam submitted successfully");
		}
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<DescriptiveEvaluationResponse> fetchTeacherDescriptiveExams(int teacherId) {
        DescriptiveEvaluationResponse response = new DescriptiveEvaluationResponse();
        User teacher = userService.getUserById(teacherId);
        if (teacher == null) {
            response.setSuccess(false);
            response.setResponseMessage("Teacher not found");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        List<Exam> exams = examService.getAllExamsByTeacher(teacher)
                .stream()
                .filter(exam -> Constants.ExamType.DESCRIPTIVE.value().equalsIgnoreCase(exam.getExamType()))
                .filter(exam -> hasPendingSubmissions(exam.getId()))
                .sorted((left, right) -> Long.compare(parseEpoch(right.getStartTime()), parseEpoch(left.getStartTime())))
                .collect(Collectors.toList());

        exams.forEach(this::populateExamForResponse);

        response.setExams(exams);
        response.setSuccess(true);
        response.setResponseMessage(CollectionUtils.isEmpty(exams)
                ? "No descriptive exam submissions found for this teacher"
                : "Descriptive exams fetched successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<DescriptiveEvaluationResponse> fetchEvaluationView(int examId) {
        DescriptiveEvaluationResponse response = new DescriptiveEvaluationResponse();

        Exam exam = examService.getExamById(examId);
        if (exam == null) {
            response.setSuccess(false);
            response.setResponseMessage("Exam not found");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        populateExamForResponse(exam);

        List<DescriptiveAnswer> answers = descriptiveAnswerService.getAnswersByExam(examId);
        if (CollectionUtils.isEmpty(answers)) {
            response.setSuccess(true);
            response.setResponseMessage("No descriptive submissions found");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        Map<Integer, DescriptiveEvaluationView> submissions = new LinkedHashMap<>();
        for (DescriptiveAnswer answer : answers) {
            int studentId = answer.getStudent().getId();
            DescriptiveEvaluationView submission = submissions.computeIfAbsent(studentId, key -> {
                DescriptiveEvaluationView view = new DescriptiveEvaluationView();
                view.setExam(exam);
                view.setStudent(answer.getStudent());
                List<ExamResult> results = examResultService.getResultsByStudentAndExam(answer.getStudent(), exam);
                if (!CollectionUtils.isEmpty(results)) {
                    view.setExamResult(results.get(0));
                }
                return view;
            });

            DescriptiveEvaluationView.QuestionEvaluationItem item = new DescriptiveEvaluationView.QuestionEvaluationItem();
            item.setQuestionId(answer.getQuestion().getId());
            item.setQuestionContent(answer.getQuestion().getQuestionContent());
            item.setTotalMarks(answer.getQuestion().getTotalMarks());
            item.setAnswerContent(answer.getAnswerContent());
            item.setScore(answer.getScore());
            item.setEvaluationStatus(answer.getEvaluationStatus());
            submission.getQuestionEvaluations().add(item);
        }

        response.setSubmissions(new ArrayList<>(submissions.values()));
        response.setSuccess(true);
        response.setResponseMessage("Descriptive submissions fetched successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<CommonApiResponse> evaluateAnswers(DescriptiveEvaluationRequest request) {
        CommonApiResponse response = new CommonApiResponse();

        if (!DescriptiveEvaluationRequest.validate(request)) {
            response.setSuccess(false);
            response.setResponseMessage("missing input or bad request");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Exam exam = examService.getExamById(request.getExamId());
        User student = userService.getUserById(request.getStudentId());
        if (exam == null || student == null) {
            response.setSuccess(false);
            response.setResponseMessage("Exam or student not found");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        List<DescriptiveAnswer> answers = descriptiveAnswerService.getAnswersByExamAndStudent(exam.getId(), student.getId());
        if (CollectionUtils.isEmpty(answers)) {
            response.setSuccess(false);
            response.setResponseMessage("Submission not found");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Map<Integer, DescriptiveAnswer> answerByQuestionId = answers.stream()
                .collect(Collectors.toMap(answer -> answer.getQuestion().getId(), answer -> answer, (left, right) -> left));

        double totalScore = 0;
        String evaluatedAt = now();
        for (DescriptiveEvaluationRequest.DescriptiveScorePayload payload : request.getEvaluations()) {
            DescriptiveAnswer answer = answerByQuestionId.get(payload.getQuestionId());
            if (answer == null) {
                response.setSuccess(false);
                response.setResponseMessage("Answer not found for one or more questions");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            double maxMarks = answer.getQuestion().getTotalMarks();
            if (payload.getScore() > maxMarks) {
                response.setSuccess(false);
                response.setResponseMessage("Score cannot exceed total marks");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            answer.setScore(payload.getScore());
            answer.setEvaluationStatus(Constants.EvaluationStatus.EVALUATED.value());
            answer.setEvaluatedTime(evaluatedAt);
            totalScore += payload.getScore();
        }

        descriptiveAnswerService.saveAll(answers);

        List<ExamResult> results = examResultService.getResultsByStudentAndExam(student, exam);
        ExamResult examResult = CollectionUtils.isEmpty(results) ? new ExamResult() : results.get(0);
        examResult.setExam(exam);
        examResult.setStudent(student);
        examResult.setTotalQuestions(answers.size());
        examResult.setTotalMarks(answers.stream().mapToDouble(answer -> answer.getQuestion().getTotalMarks()).sum());
        examResult.setTotalCorrectAnswers(0);
        examResult.setTotalWrongAnswers(0);
        examResult.setScore(totalScore);
        examResult.setPercentage(formatPercentage((totalScore / examResult.getTotalMarks()) * 100.0));
        examResult.setEvaluationStatus(Constants.EvaluationStatus.EVALUATED.value());
        examResult.setResultStatus(examResult.getPercentage() >= 35.0
                ? Constants.ExamResultStatus.PASS.value()
                : Constants.ExamResultStatus.FAIL.value());
        if (examResult.getDateTime() == null) {
            examResult.setDateTime(evaluatedAt);
        }
        examResultService.addResult(examResult);

        try {
            this.emailService.sendExamResultEmail(student.getEmailId(), student.getFirstName() + " " + student.getLastName(), examResult, universityName);
            log.info("Descriptive Exam Result Mail Sent to " + student.getEmailId());
        } catch (Exception e) {
            log.error("Failed to send Descriptive Exam Result Mail to " + student.getEmailId(), e);
        }

        response.setSuccess(true);
        response.setResponseMessage("Descriptive evaluation submitted successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<List<AiEvaluationResponseDto>> aiGradeAnswers(AiEvaluationRequestDto request) {
        Exam exam = examService.getExamById(request.getExamId());
        User student = userService.getUserById(request.getStudentId());

        if (exam == null || student == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        List<DescriptiveAnswer> answers = descriptiveAnswerService.getAnswersByExamAndStudent(exam.getId(), student.getId());
        if (CollectionUtils.isEmpty(answers)) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        List<Map<String, Object>> gradingBatch = new ArrayList<>();
        for (DescriptiveAnswer answer : answers) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("questionId", answer.getQuestion().getId());
            item.put("questionText", answer.getQuestion().getQuestionContent());
            item.put("totalMarks", answer.getQuestion().getTotalMarks());
            item.put("studentAnswer", answer.getAnswerContent());
            gradingBatch.add(item);
        }

        try {
            List<AiEvaluationResponseDto> evaluationResults = aiQuestionGenerationService.evaluateDescriptiveAnswers(gradingBatch);
            return new ResponseEntity<>(evaluationResults, HttpStatus.OK);
        } catch (Exception e) {
            log.error("AI Evaluation failed", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private double formatPercentage(double percentage) {
        DecimalFormat df = new DecimalFormat("#.##");
        return Double.parseDouble(df.format(percentage));
    }

    private String now() {
        return String.valueOf(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
    }

    private long parseEpoch(String value) {
        try {
            return Long.parseLong(value);
        } catch (Exception exception) {
            return 0L;
        }
    }

    private void populateExamForResponse(Exam exam) {
        exam.setDescriptiveQuestions(descriptiveQuestionService.getQuestionsByExam(exam));
    }

    private boolean hasPendingSubmissions(int examId) {
        List<DescriptiveAnswer> answers = descriptiveAnswerService.getAnswersByExam(examId);
        if (CollectionUtils.isEmpty(answers)) {
            return false;
        }

        return answers.stream().anyMatch(answer ->
                !Constants.EvaluationStatus.EVALUATED.value().equalsIgnoreCase(answer.getEvaluationStatus()));
    }
}
