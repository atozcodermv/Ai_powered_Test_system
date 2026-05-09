package ExamPortal.resource;

import ExamPortal.dto.PlagiarismCheckRequestDto;
import ExamPortal.dto.PlagiarismResponseDto;
import ExamPortal.dto.PlagiarismResultDto;
import ExamPortal.entities.Exam;
import ExamPortal.entities.ExamPlagiarism;
import ExamPortal.entities.User;
import ExamPortal.repositories.ExamPlagiarismRepository;
import ExamPortal.services.ExamService;
import ExamPortal.services.UserService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExamPlagiarismResource {

    @Autowired
    private ExamPlagiarismRepository examPlagiarismRepository;

    @Autowired
    private ExamService examService;

    @Autowired
    private UserService userService;

    @Autowired
    private ChatClient.Builder chatClientBuilder;

    private final ObjectMapper mapper = new ObjectMapper();

    @Transactional
    public ResponseEntity<PlagiarismResponseDto> checkPlagiarism(PlagiarismCheckRequestDto request) {
        PlagiarismResponseDto response = new PlagiarismResponseDto();

        if (request == null || request.getExamId() == 0 || request.getSubmissions() == null || request.getSubmissions().isEmpty()) {
            response.setResponseMessage("Invalid request or empty submissions.");
            response.setSuccess(false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Exam exam = examService.getExamById(request.getExamId());
        if (exam == null) {
            response.setResponseMessage("Exam not found.");
            response.setSuccess(false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // Check if report already exists inside DB
        List<ExamPlagiarism> existingReports = examPlagiarismRepository.findByExam(exam);
        if (!existingReports.isEmpty()) {
            List<PlagiarismResultDto> dtos = new ArrayList<>();
            for (ExamPlagiarism ep : existingReports) {
                dtos.add(new PlagiarismResultDto(
                        ep.getStudent().getId(),
                        ep.getStudent().getFirstName() + " " + ep.getStudent().getLastName(),
                        ep.getSimilarityPercentage(),
                        ep.getPlagiarismStatus()
                ));
            }
            response.setResults(dtos);
            response.setResponseMessage("Fetched existing plagiarism report.");
            response.setSuccess(true);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        // If not, ask AI
        try {
            String submissionsJson = mapper.writeValueAsString(request.getSubmissions());
            String prompt = "You are an AI Plagiarism Detection assistant grading high school exams. " +
                    "I will give you a list of student submissions in JSON format, each with 'studentId', 'studentName', and their 'answers' array. " +
                    "Your job is to compare all the 'answerContent' properties across all students, AND optionally compare conceptually to known web sources. " +
                    "For each student, provide a 'similarityPercentage' (0-100) indicating how much their answers match others or web sources. " +
                    "If 'similarityPercentage' >= 90, set 'plagiarismStatus' to true. Otherwise, false. " +
                    "Return ONLY a strictly valid JSON array of objects, where each object has: " +
                    "studentId (number), studentName (string), similarityPercentage (number), and plagiarismStatus (boolean). " +
                    "Do NOT wrap the response in markdown blocks like ```json ... ```, output just the raw JSON array string. " +
                    "Here are the submissions:\n" + submissionsJson;

            ChatClient chatClient = chatClientBuilder.build();
            String aiResponse = chatClient.prompt().user(prompt).call().content();

            // Strip markdown backticks if AI decided to inject them anyway
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.substring(7);
            }
            if (aiResponse.startsWith("```")) {
                aiResponse = aiResponse.substring(3);
            }
            if (aiResponse.endsWith("```")) {
                aiResponse = aiResponse.substring(0, aiResponse.length() - 3);
            }
            aiResponse = aiResponse.trim();

            List<PlagiarismResultDto> parsedResults = mapper.readValue(aiResponse, new TypeReference<List<PlagiarismResultDto>>() {});

            // Save to DB
            for (PlagiarismResultDto dto : parsedResults) {
                ExamPlagiarism ep = new ExamPlagiarism();
                ep.setExam(exam);
                User student = userService.getUserById(dto.getStudentId());
                ep.setStudent(student);
                ep.setSimilarityPercentage(dto.getSimilarityPercentage());
                ep.setPlagiarismStatus(dto.getPlagiarismStatus());
                examPlagiarismRepository.save(ep);
            }

            response.setResults(parsedResults);
            response.setResponseMessage("Plagiarism check completed successfully.");
            response.setSuccess(true);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("AI Processing Exception: " + e.getMessage());
            e.printStackTrace();
            response.setResponseMessage("Failed to run AI check: " + e.getMessage());
            response.setSuccess(false);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<PlagiarismResponseDto> fetchPlagiarismByStudent(int studentId) {
        PlagiarismResponseDto response = new PlagiarismResponseDto();

        User student = userService.getUserById(studentId);
        if (student == null) {
            response.setResponseMessage("Student not found.");
            response.setSuccess(false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        List<ExamPlagiarism> reports = examPlagiarismRepository.findByStudent(student);
        List<PlagiarismResultDto> dtos = new ArrayList<>();
        for (ExamPlagiarism ep : reports) {
            dtos.add(new PlagiarismResultDto(
                    ep.getStudent().getId(),
                    ep.getStudent().getFirstName() + " " + ep.getStudent().getLastName(),
                    ep.getSimilarityPercentage(),
                    ep.getPlagiarismStatus()
            ));
        }

        response.setResults(dtos);
        response.setResponseMessage("Fetched plagiarism reports.");
        response.setSuccess(true);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
