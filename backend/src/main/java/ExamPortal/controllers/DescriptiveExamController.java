package ExamPortal.controllers;

import ExamPortal.entities.CommonApiResponse;
import ExamPortal.entities.DescriptiveAnswerSubmissionRequest;
import ExamPortal.entities.DescriptiveEvaluationRequest;
import ExamPortal.entities.DescriptiveEvaluationResponse;
import ExamPortal.entities.DescriptiveQuestionRequest;
import ExamPortal.entities.DescriptiveQuestionResponse;
import ExamPortal.dto.AiEvaluationRequestDto;
import ExamPortal.dto.AiEvaluationResponseDto;
import ExamPortal.resource.DescriptiveExamResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/descriptive")
@CrossOrigin(origins = "http://localhost:3000")
public class DescriptiveExamController {

    @Autowired
    private DescriptiveExamResource descriptiveExamResource;

    @PostMapping("/question/add")
    public ResponseEntity<DescriptiveQuestionResponse> addQuestions(@RequestBody DescriptiveQuestionRequest request) {
        return descriptiveExamResource.addQuestions(request);
    }

    @GetMapping("/question/fetch/exam-wise")
    public ResponseEntity<DescriptiveQuestionResponse> fetchQuestionsByExam(@RequestParam("examId") int examId,
                                                                            @RequestParam(value = "studentId", required = false, defaultValue = "0") int studentId) {
        return descriptiveExamResource.fetchQuestionsByExam(examId, studentId);
    }

    @PostMapping("/answer/submit")
    public ResponseEntity<CommonApiResponse> submitAnswers(@RequestBody DescriptiveAnswerSubmissionRequest request) {
        return descriptiveExamResource.submitAnswers(request);
    }

    @GetMapping("/teacher/exams")
    public ResponseEntity<DescriptiveEvaluationResponse> fetchTeacherDescriptiveExams(@RequestParam("teacherId") int teacherId) {
        return descriptiveExamResource.fetchTeacherDescriptiveExams(teacherId);
    }

    @GetMapping("/evaluation/fetch")
    public ResponseEntity<DescriptiveEvaluationResponse> fetchEvaluationView(@RequestParam("examId") int examId) {
        return descriptiveExamResource.fetchEvaluationView(examId);
    }

    @PostMapping("/evaluation/submit")
    public ResponseEntity<CommonApiResponse> evaluateAnswers(@RequestBody DescriptiveEvaluationRequest request) {
        return descriptiveExamResource.evaluateAnswers(request);
    }

    @PostMapping("/evaluation/ai-grade")
    public ResponseEntity<List<AiEvaluationResponseDto>> aiGradeAnswers(@RequestBody AiEvaluationRequestDto request) {
        return descriptiveExamResource.aiGradeAnswers(request);
    }
}

